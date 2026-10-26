const router = require('express').Router();
const { z } = require('zod');
const { authenticate, requireProfile } = require('../../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const VirtualPortfolio = require('../../models/VirtualPortfolio');
const SimulatedOrder = require('../../models/SimulatedOrder');
const TradeTransaction = require('../../models/TradeTransaction');
const Stock = require('../../models/Stock');
const Watchlist = require('../../models/Watchlist');
const AuditLog = require('../../models/AuditLog');
const { executeOrder, calculateTransactionCost } = require('../../services/marketDataService');

const auth = [authenticate, requireProfile];

// GET /api/v1/paper-trading/portfolio
router.get('/portfolio', auth, async (req, res, next) => {
  try {
    let portfolio = await VirtualPortfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = await VirtualPortfolio.create({ userId: req.user._id });
    }

    // Update current prices
    if (portfolio.holdings.length > 0) {
      const symbols = portfolio.holdings.map((h) => h.symbol);
      const stocks = await Stock.find({ symbol: { $in: symbols } });
      const priceMap = {};
      stocks.forEach((s) => (priceMap[s.symbol] = s.currentPrice));

      portfolio.holdings.forEach((h) => {
        const price = priceMap[h.symbol] || h.currentPrice;
        h.currentPrice = price;
        h.unrealizedPnL = +((price - h.averageBuyPrice) * h.quantity).toFixed(2);
        h.unrealizedPnLPercent = +((price - h.averageBuyPrice) / h.averageBuyPrice * 100).toFixed(2);
      });
      portfolio.recalculate();
      await portfolio.save();
    }

    const holdingsValue = portfolio.holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
    const totalReturn = portfolio.portfolioValue - portfolio.initialBalance;
    const totalReturnPct = (totalReturn / portfolio.initialBalance) * 100;

    res.json({
      portfolio,
      summary: {
        initialBalance: portfolio.initialBalance,
        cashBalance: +portfolio.cashBalance.toFixed(2),
        holdingsValue: +holdingsValue.toFixed(2),
        portfolioValue: +portfolio.portfolioValue.toFixed(2),
        totalReturn: +totalReturn.toFixed(2),
        totalReturnPercent: +totalReturnPct.toFixed(2),
        realizedPnL: +portfolio.realizedPnL.toFixed(2),
        unrealizedPnL: +portfolio.holdings.reduce((s, h) => s + h.unrealizedPnL, 0).toFixed(2),
        totalTransactionCosts: +portfolio.totalTransactionCosts.toFixed(2),
        totalTrades: portfolio.totalTrades,
        maxDrawdown: +(portfolio.maxDrawdown * 100).toFixed(2),
      },
      simulationMode: true,
      disclaimer: 'All balances and trades are virtual. Not real money.',
    });
  } catch (err) { next(err); }
});

// POST /api/v1/paper-trading/orders
const orderSchema = z.object({
  stockId: z.string(),
  orderType: z.enum(['market', 'limit', 'stop-loss']),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().int().positive().max(10000),
  limitPrice: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().max(100).optional(),
});

router.post('/orders', auth, async (req, res, next) => {
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid order data.', details: parsed.error.flatten() });
    }
    const { stockId, orderType, side, quantity, limitPrice, stopPrice, notes, idempotencyKey } = parsed.data;

    // Idempotency check
    const iKey = idempotencyKey || uuidv4();
    const duplicate = await SimulatedOrder.findOne({ idempotencyKey: iKey });
    if (duplicate) {
      return res.json({ success: true, order: duplicate, duplicate: true });
    }

    const stock = await Stock.findOne({
      $or: [{ _id: stockId }, { symbol: stockId.toUpperCase() }],
      isActive: true,
    });
    if (!stock) return res.status(404).json({ error: 'Stock not found.' });

    const portfolio = await VirtualPortfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found.' });

    // Use current price for market orders
    const executedPrice = orderType === 'market'
      ? stock.currentPrice
      : limitPrice || stock.currentPrice;

    const cost = calculateTransactionCost(side, quantity, executedPrice);
    const totalValue = +(quantity * executedPrice).toFixed(2);

    // Pre-flight checks
    if (side === 'buy') {
      const totalCost = totalValue + cost.total;
      if (portfolio.cashBalance < totalCost) {
        return res.status(400).json({
          error: `Insufficient virtual cash. Need ₹${totalCost.toFixed(2)}, have ₹${portfolio.cashBalance.toFixed(2)}.`,
        });
      }
    } else {
      const holding = portfolio.holdings.find((h) => h.symbol === stock.symbol);
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({
          error: `Insufficient holdings. You have ${holding?.quantity || 0} shares.`,
        });
      }
    }

    // Create order
    const order = await SimulatedOrder.create({
      userId: req.user._id,
      stockId: stock._id,
      symbol: stock.symbol,
      orderType,
      side,
      quantity,
      limitPrice,
      stopPrice,
      status: 'executed',
      executedPrice,
      executedQuantity: quantity,
      executedAt: new Date(),
      transactionCost: cost.total,
      totalValue,
      notes,
      idempotencyKey: iKey,
    });

    // Execute
    const { realizedPnL, transactionCost } = await executeOrder({ order, portfolio, stock });

    portfolio.totalTrades += 1;
    portfolio.recalculate();
    await portfolio.save();

    // Transaction record
    await TradeTransaction.create({
      userId: req.user._id,
      orderId: order._id,
      stockId: stock._id,
      symbol: stock.symbol,
      side,
      quantity,
      price: executedPrice,
      totalValue,
      transactionCost,
      netValue: side === 'buy' ? totalValue + transactionCost : totalValue - transactionCost,
      cashBefore: side === 'buy' ? portfolio.cashBalance + (totalValue + transactionCost) : portfolio.cashBalance - (totalValue - transactionCost),
      cashAfter: portfolio.cashBalance,
      realizedPnL,
      averageBuyPrice: portfolio.holdings.find((h) => h.symbol === stock.symbol)?.averageBuyPrice,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'TRADE_EXECUTED',
      resourceId: order._id,
      details: { symbol: stock.symbol, side, quantity, executedPrice, transactionCost },
    });

    res.json({
      success: true,
      order,
      transactionCost: cost,
      portfolio: {
        cashBalance: portfolio.cashBalance,
        portfolioValue: portfolio.portfolioValue,
      },
      simulationMode: true,
    });
  } catch (err) { next(err); }
});

// GET /api/v1/paper-trading/orders
router.get('/orders', auth, async (req, res, next) => {
  try {
    const orders = await SimulatedOrder.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ orders });
  } catch (err) { next(err); }
});

// GET /api/v1/paper-trading/transactions
router.get('/transactions', auth, async (req, res, next) => {
  try {
    const txns = await TradeTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ transactions: txns });
  } catch (err) { next(err); }
});

// GET /api/v1/paper-trading/performance
router.get('/performance', auth, async (req, res, next) => {
  try {
    const portfolio = await VirtualPortfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.json({ performance: null });

    const totalReturn = portfolio.portfolioValue - portfolio.initialBalance;
    const returnPct = (totalReturn / portfolio.initialBalance) * 100;

    res.json({
      performance: {
        initialBalance: portfolio.initialBalance,
        currentValue: portfolio.portfolioValue,
        totalReturn: +totalReturn.toFixed(2),
        totalReturnPercent: +returnPct.toFixed(2),
        realizedPnL: portfolio.realizedPnL,
        unrealizedPnL: portfolio.holdings.reduce((s, h) => s + h.unrealizedPnL, 0),
        maxDrawdown: +(portfolio.maxDrawdown * 100).toFixed(2),
        totalTrades: portfolio.totalTrades,
        totalTransactionCosts: portfolio.totalTransactionCosts,
      },
      simulationMode: true,
    });
  } catch (err) { next(err); }
});

// GET /api/v1/paper-trading/watchlist
router.get('/watchlist', auth, async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user._id }).populate('stocks.stockId');
    if (!watchlist) watchlist = { stocks: [] };
    res.json({ watchlist: watchlist.stocks || [] });
  } catch (err) { next(err); }
});

// POST /api/v1/paper-trading/watchlist
router.post('/watchlist', auth, async (req, res, next) => {
  try {
    const { symbol, notes } = req.body;
    const stock = await Stock.findOne({ symbol: symbol?.toUpperCase(), isActive: true });
    if (!stock) return res.status(404).json({ error: 'Stock not found.' });

    await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      {
        $addToSet: {
          stocks: { stockId: stock._id, symbol: stock.symbol, notes },
        },
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/v1/paper-trading/watchlist/:stockId
router.delete('/watchlist/:stockId', auth, async (req, res, next) => {
  try {
    await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { stocks: { $or: [{ stockId: req.params.stockId }, { symbol: req.params.stockId.toUpperCase() }] } } }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/v1/paper-trading/reset
router.post('/reset', auth, async (req, res, next) => {
  try {
    const portfolio = await VirtualPortfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found.' });

    portfolio.cashBalance = portfolio.initialBalance;
    portfolio.holdings = [];
    portfolio.realizedPnL = 0;
    portfolio.totalTransactionCosts = 0;
    portfolio.totalTrades = 0;
    portfolio.portfolioValue = portfolio.initialBalance;
    portfolio.peakValue = portfolio.initialBalance;
    portfolio.maxDrawdown = 0;
    portfolio.resetCount += 1;
    portfolio.lastResetAt = new Date();
    await portfolio.save();

    await AuditLog.create({ userId: req.user._id, action: 'PORTFOLIO_RESET' });

    res.json({ success: true, portfolio });
  } catch (err) { next(err); }
});

module.exports = router;
