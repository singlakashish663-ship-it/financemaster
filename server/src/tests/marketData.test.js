'use strict';
const { generateHistory, calculateTransactionCost, executeOrder } = require('../services/marketDataService');

const mockStock = {
  _id: 'stock123',
  symbol: 'NVT',
  name: 'NovaTech Industries',
  currentPrice: 847,
  volatility: 0.025,
  beta: 1.2,
  trend: 0.0003,
  seed: 1001,
};

describe('Market Data Service', () => {

  /* ---- generateHistory ---- */
  describe('generateHistory', () => {
    it('returns correct number of bars', () => {
      const bars = generateHistory(mockStock, 100, '1d');
      expect(bars).toHaveLength(100);
    });

    it('each candle has required OHLCV fields', () => {
      const bars = generateHistory(mockStock, 10, '1d');
      bars.forEach((bar) => {
        expect(bar).toHaveProperty('time');
        expect(bar).toHaveProperty('open');
        expect(bar).toHaveProperty('high');
        expect(bar).toHaveProperty('low');
        expect(bar).toHaveProperty('close');
        expect(bar).toHaveProperty('volume');
      });
    });

    it('high >= close and high >= open for every candle', () => {
      const bars = generateHistory(mockStock, 50, '1d');
      bars.forEach((bar) => {
        expect(bar.high).toBeGreaterThanOrEqual(bar.open);
        expect(bar.high).toBeGreaterThanOrEqual(bar.close);
      });
    });

    it('low <= close and low <= open for every candle', () => {
      const bars = generateHistory(mockStock, 50, '1d');
      bars.forEach((bar) => {
        expect(bar.low).toBeLessThanOrEqual(bar.open);
        expect(bar.low).toBeLessThanOrEqual(bar.close);
      });
    });

    it('is deterministic with the same seed', () => {
      const b1 = generateHistory(mockStock, 20, '1d');
      const b2 = generateHistory(mockStock, 20, '1d');
      expect(b1[0].close).toBe(b2[0].close);
      expect(b1[10].close).toBe(b2[10].close);
    });

    it('produces different sequences for different seeds', () => {
      const stock2 = { ...mockStock, seed: 9999, symbol: 'GRB' };
      const b1 = generateHistory(mockStock, 20, '1d');
      const b2 = generateHistory(stock2, 20, '1d');
      expect(b1[0].close).not.toBe(b2[0].close);
    });

    it('all prices are positive', () => {
      const bars = generateHistory(mockStock, 100, '1d');
      bars.forEach((bar) => {
        expect(bar.open).toBeGreaterThan(0);
        expect(bar.high).toBeGreaterThan(0);
        expect(bar.low).toBeGreaterThan(0);
        expect(bar.close).toBeGreaterThan(0);
      });
    });
  });

  /* ---- calculateTransactionCost ---- */
  describe('calculateTransactionCost', () => {
    it('applies minimum brokerage for tiny trades', () => {
      const cost = calculateTransactionCost('buy', 1, 10);
      expect(cost.brokerage).toBe(20); // minimum ₹20
    });

    it('calculates brokerage as percentage for larger trades', () => {
      const cost = calculateTransactionCost('buy', 100, 1000);
      const expected = Math.max(20, 100 * 1000 * 0.0005);
      expect(cost.brokerage).toBeCloseTo(expected, 1);
    });

    it('includes STT component', () => {
      const cost = calculateTransactionCost('sell', 10, 500);
      expect(cost.stt).toBeGreaterThan(0);
    });

    it('total equals brokerage + STT', () => {
      const cost = calculateTransactionCost('buy', 50, 200);
      expect(cost.total).toBeCloseTo(cost.brokerage + cost.stt, 2);
    });

    it('breakdown array sums to total', () => {
      const cost = calculateTransactionCost('buy', 20, 400);
      const sum = cost.breakdown.reduce((s, b) => s + b.amount, 0);
      expect(sum).toBeCloseTo(cost.total, 1);
    });
  });

  /* ---- executeOrder ---- */
  describe('executeOrder', () => {
    function makePortfolio(overrides = {}) {
      return {
        cashBalance: 100000,
        holdings: [],
        realizedPnL: 0,
        totalTransactionCosts: 0,
        recalculate: jest.fn(),
        ...overrides,
      };
    }

    it('deducts correct amount from cash on buy', async () => {
      const portfolio = makePortfolio();
      const order     = { side: 'buy', quantity: 10, executedPrice: 847 };
      await executeOrder({ order, portfolio, stock: mockStock });
      const cost     = calculateTransactionCost('buy', 10, 847);
      const expected = 100000 - (10 * 847) - cost.total;
      expect(portfolio.cashBalance).toBeCloseTo(expected, 0);
    });

    it('adds holding on buy', async () => {
      const portfolio = makePortfolio();
      const order     = { side: 'buy', quantity: 5, executedPrice: 847 };
      await executeOrder({ order, portfolio, stock: mockStock });
      expect(portfolio.holdings).toHaveLength(1);
      expect(portfolio.holdings[0].symbol).toBe('NVT');
      expect(portfolio.holdings[0].quantity).toBe(5);
    });

    it('averages down correctly on second buy', async () => {
      const portfolio = makePortfolio();
      await executeOrder({ order: { side: 'buy', quantity: 10, executedPrice: 800 }, portfolio, stock: mockStock });
      await executeOrder({ order: { side: 'buy', quantity: 10, executedPrice: 900 }, portfolio, stock: mockStock });
      const h = portfolio.holdings[0];
      expect(h.quantity).toBe(20);
      expect(h.averageBuyPrice).toBeCloseTo(850, 0); // simple average
    });

    it('throws on insufficient cash', async () => {
      const portfolio = makePortfolio({ cashBalance: 100 });
      const order     = { side: 'buy', quantity: 100, executedPrice: 847 };
      await expect(executeOrder({ order, portfolio, stock: mockStock })).rejects.toThrow('Insufficient');
    });

    it('throws on insufficient holdings for sell', async () => {
      const portfolio = makePortfolio({
        holdings: [{ symbol: 'NVT', stockId: 'stock123', quantity: 5, averageBuyPrice: 800, totalInvested: 4000, currentPrice: 847, unrealizedPnL: 0, unrealizedPnLPercent: 0, lastUpdatedAt: new Date(), firstBoughtAt: new Date() }],
      });
      const order = { side: 'sell', quantity: 100, executedPrice: 847 };
      await expect(executeOrder({ order, portfolio, stock: mockStock })).rejects.toThrow('Insufficient');
    });

    it('calculates realised P&L correctly on sell', async () => {
      const avgBuy = 700, sellPrice = 847, qty = 10;
      const portfolio = makePortfolio({
        cashBalance: 50000,
        holdings: [{ symbol: 'NVT', stockId: 'stock123', quantity: qty, averageBuyPrice: avgBuy, totalInvested: qty * avgBuy, currentPrice: sellPrice, unrealizedPnL: 0, unrealizedPnLPercent: 0, lastUpdatedAt: new Date(), firstBoughtAt: new Date() }],
      });
      const order = { side: 'sell', quantity: qty, executedPrice: sellPrice };
      const { realizedPnL } = await executeOrder({ order, portfolio, stock: mockStock });
      const cost = calculateTransactionCost('sell', qty, sellPrice);
      const expected = (sellPrice - avgBuy) * qty - cost.total;
      expect(realizedPnL).toBeCloseTo(expected, 0);
    });

    it('removes holding when all shares sold', async () => {
      const portfolio = makePortfolio({
        cashBalance: 50000,
        holdings: [{ symbol: 'NVT', stockId: 'stock123', quantity: 5, averageBuyPrice: 800, totalInvested: 4000, currentPrice: 847, unrealizedPnL: 0, unrealizedPnLPercent: 0, lastUpdatedAt: new Date(), firstBoughtAt: new Date() }],
      });
      await executeOrder({ order: { side: 'sell', quantity: 5, executedPrice: 847 }, portfolio, stock: mockStock });
      expect(portfolio.holdings).toHaveLength(0);
    });
  });
});
