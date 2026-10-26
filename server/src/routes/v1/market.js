const router = require('express').Router();
const Stock = require('../../models/Stock');
const { generateHistory, tickPrice } = require('../../services/marketDataService');

// GET /api/v1/market/stocks
router.get('/stocks', async (req, res, next) => {
  try {
    const stocks = await Stock.find({ isActive: true }).select('-seed -__v');
    res.json({
      stocks,
      dataSource: 'synthetic',
      simulationMode: true,
      disclaimer: 'All prices are synthetic simulation data. Not real market prices.',
    });
  } catch (err) { next(err); }
});

// GET /api/v1/market/stocks/:stockId
router.get('/stocks/:stockId', async (req, res, next) => {
  try {
    const stock = await Stock.findOne({
      $or: [{ _id: req.params.stockId }, { symbol: req.params.stockId.toUpperCase() }],
      isActive: true,
    }).select('-__v');
    if (!stock) return res.status(404).json({ error: 'Stock not found.' });
    res.json({ stock, simulationMode: true });
  } catch (err) { next(err); }
});

// GET /api/v1/market/stocks/:stockId/history
router.get('/stocks/:stockId/history', async (req, res, next) => {
  try {
    const { timeframe = '1d', bars = '365' } = req.query;
    const allowedTimeframes = ['1d', '1h', '15m', '5m'];
    const tf = allowedTimeframes.includes(timeframe) ? timeframe : '1d';
    const numBars = Math.min(Math.max(parseInt(bars) || 100, 10), 1000);

    const stock = await Stock.findOne({
      $or: [{ _id: req.params.stockId }, { symbol: req.params.stockId.toUpperCase() }],
      isActive: true,
    });
    if (!stock) return res.status(404).json({ error: 'Stock not found.' });

    const candles = generateHistory(stock, numBars, tf);

    res.json({
      symbol: stock.symbol,
      timeframe: tf,
      candles,
      simulationMode: true,
      disclaimer: 'Synthetic simulation data for educational purposes.',
    });
  } catch (err) { next(err); }
});

module.exports = router;
