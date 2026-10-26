const mongoose = require('mongoose');
const { Schema } = mongoose;

const holdingSchema = new Schema({
  stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
  symbol: { type: String, required: true, uppercase: true },
  quantity: { type: Number, required: true, min: 0 },
  averageBuyPrice: { type: Number, required: true, min: 0 },
  totalInvested: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, default: 0 },
  unrealizedPnL: { type: Number, default: 0 },
  unrealizedPnLPercent: { type: Number, default: 0 },
  firstBoughtAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now },
}, { _id: false });

const portfolioSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true, unique: true },
  initialBalance: { type: Number, default: 100000, min: 0 },
  cashBalance: { type: Number, default: 100000, min: 0 },
  holdings: [holdingSchema],
  totalInvested: { type: Number, default: 0, min: 0 },
  realizedPnL: { type: Number, default: 0 },
  totalTransactionCosts: { type: Number, default: 0, min: 0 },
  totalTrades: { type: Number, default: 0, min: 0 },
  portfolioValue: { type: Number, default: 100000 }, // cash + holdings current value
  peakValue: { type: Number, default: 100000 },
  maxDrawdown: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  resetCount: { type: Number, default: 0 },
  lastResetAt: { type: Date },
  lastUpdatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Method: Calculate total portfolio value
portfolioSchema.methods.recalculate = function () {
  const holdingsValue = this.holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  this.portfolioValue = this.cashBalance + holdingsValue;
  this.totalInvested = this.holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  if (this.portfolioValue > this.peakValue) {
    this.peakValue = this.portfolioValue;
  }
  const drawdown = (this.peakValue - this.portfolioValue) / this.peakValue;
  if (drawdown > this.maxDrawdown) this.maxDrawdown = drawdown;
};

module.exports = mongoose.model('VirtualPortfolio', portfolioSchema);
