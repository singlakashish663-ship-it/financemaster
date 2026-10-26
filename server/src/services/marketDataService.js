'use strict';
/**
 * FinanceQuest Market Data Service
 *
 * All prices in this service are SYNTHETIC SIMULATION DATA.
 * They do not represent real exchange prices, real companies, or real market activity.
 * Every response is labeled with dataSource: 'synthetic'.
 */

const Stock = require('../models/Stock');

const BROKERAGE_RATE = 0.0005; // 0.05% per side
const MIN_BROKERAGE = 20; // ₹20 minimum
const STT_BUY_RATE = 0.001; // Securities Transaction Tax (India equivalent, fictional)
const STT_SELL_RATE = 0.001;

/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Produces deterministic sequences given the same seed.
 */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generate synthetic OHLCV candle history for a stock.
 * @param {Object} stock - Stock document
 * @param {number} bars - Number of bars
 * @param {string} timeframe - '1d', '1h', '15m'
 * @returns {Array} candles
 */
function generateHistory(stock, bars = 365, timeframe = '1d') {
  const rand = mulberry32(stock.seed || stock.symbol.charCodeAt(0) * 100);
  const volatility = stock.volatility || 0.02;
  const trend = stock.trend || 0;

  // Work backwards from currentPrice
  const prices = [stock.currentPrice];
  for (let i = 1; i < bars; i++) {
    const prev = prices[prices.length - 1];
    const change = (rand() - 0.5) * 2 * volatility + trend / bars;
    prices.push(Math.max(1, prev * (1 + change)));
  }
  prices.reverse();

  const now = Date.now();
  const intervalMs = {
    '1d': 24 * 60 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '5m': 5 * 60 * 1000,
  }[timeframe] || 24 * 60 * 60 * 1000;

  return prices.map((close, i) => {
    const rand2 = mulberry32(stock.seed + i + 1);
    const open = i === 0 ? close : prices[i - 1];
    const high = Math.max(open, close) * (1 + rand2() * 0.015);
    const low = Math.min(open, close) * (1 - rand2() * 0.015);
    const volume = Math.floor(50000 + rand2() * 500000);
    const time = Math.floor((now - (bars - i) * intervalMs) / 1000);
    return {
      time,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    };
  });
}

/**
 * Simulate a market tick — advance price by one step.
 */
function tickPrice(stock) {
  const rand = mulberry32(stock.seed + Date.now());
  const change = (rand() - 0.5) * 2 * (stock.volatility || 0.02) * 0.3;
  const newPrice = Math.max(0.01, stock.currentPrice * (1 + change));
  return +newPrice.toFixed(2);
}

/**
 * Calculate transaction costs for a simulated order.
 */
function calculateTransactionCost(side, quantity, price) {
  const value = quantity * price;
  const brokerage = Math.max(MIN_BROKERAGE, value * BROKERAGE_RATE);
  const stt = value * (side === 'buy' ? STT_BUY_RATE : STT_SELL_RATE);
  const total = brokerage + stt;
  return {
    brokerage: +brokerage.toFixed(2),
    stt: +stt.toFixed(2),
    total: +total.toFixed(2),
    breakdown: [
      { label: 'Brokerage (0.05%)', amount: +brokerage.toFixed(2) },
      { label: `STT (${side === 'buy' ? '0.1%' : '0.1%'})`, amount: +stt.toFixed(2) },
    ],
  };
}

/**
 * Execute a simulated order and update portfolio.
 * All validation and arithmetic is done server-side.
 */
async function executeOrder({ order, portfolio, stock }) {
  const { side, quantity, executedPrice } = order;
  const cost = calculateTransactionCost(side, quantity, executedPrice);
  const totalValue = +(quantity * executedPrice).toFixed(2);
  const netCost = +(totalValue + cost.total).toFixed(2); // for buy
  const netProceeds = +(totalValue - cost.total).toFixed(2); // for sell

  if (side === 'buy') {
    if (portfolio.cashBalance < netCost) {
      throw Object.assign(new Error('Insufficient virtual cash balance.'), { status: 400 });
    }

    portfolio.cashBalance = +(portfolio.cashBalance - netCost).toFixed(2);
    portfolio.totalTransactionCosts = +(portfolio.totalTransactionCosts + cost.total).toFixed(2);

    // Update holdings
    const existing = portfolio.holdings.find((h) => h.symbol === stock.symbol);
    if (existing) {
      const newTotal = existing.totalInvested + totalValue;
      const newQty = existing.quantity + quantity;
      existing.averageBuyPrice = +(newTotal / newQty).toFixed(2);
      existing.quantity = newQty;
      existing.totalInvested = +newTotal.toFixed(2);
      existing.lastUpdatedAt = new Date();
    } else {
      portfolio.holdings.push({
        stockId: stock._id,
        symbol: stock.symbol,
        quantity,
        averageBuyPrice: executedPrice,
        totalInvested: totalValue,
        currentPrice: executedPrice,
        firstBoughtAt: new Date(),
        lastUpdatedAt: new Date(),
      });
    }

    return { realizedPnL: 0, transactionCost: cost.total };
  } else {
    // sell
    const holding = portfolio.holdings.find((h) => h.symbol === stock.symbol);
    if (!holding || holding.quantity < quantity) {
      throw Object.assign(new Error('Insufficient holdings.'), { status: 400 });
    }

    const realizedPnL = +((executedPrice - holding.averageBuyPrice) * quantity - cost.total).toFixed(2);

    holding.quantity -= quantity;
    holding.totalInvested = +(holding.quantity * holding.averageBuyPrice).toFixed(2);
    holding.lastUpdatedAt = new Date();

    if (holding.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== stock.symbol);
    }

    portfolio.cashBalance = +(portfolio.cashBalance + netProceeds).toFixed(2);
    portfolio.realizedPnL = +(portfolio.realizedPnL + realizedPnL).toFixed(2);
    portfolio.totalTransactionCosts = +(portfolio.totalTransactionCosts + cost.total).toFixed(2);

    return { realizedPnL, transactionCost: cost.total };
  }
}

module.exports = {
  generateHistory,
  tickPrice,
  calculateTransactionCost,
  executeOrder,
  BROKERAGE_RATE,
  MIN_BROKERAGE,
};
