const mongoose = require('mongoose');
const { Schema } = mongoose;

// Fictional stock universe for educational simulation
const stockSchema = new Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  sector: {
    type: String,
    enum: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrials', 'Materials', 'Utilities', 'Real Estate', 'Telecom'],
    required: true,
  },
  description: { type: String },
  isFictional: { type: Boolean, default: true }, // Always true for simulation
  dataSource: {
    type: String,
    enum: ['synthetic', 'historical', 'live'],
    default: 'synthetic',
  },

  // Current simulation price
  currentPrice: { type: Number, required: true, min: 0 },
  previousClose: { type: Number, min: 0 },
  openPrice: { type: Number, min: 0 },
  dayHigh: { type: Number, min: 0 },
  dayLow: { type: Number, min: 0 },
  volume: { type: Number, default: 0, min: 0 },
  marketCap: { type: Number, min: 0 },

  // Fundamentals (fictional for simulation)
  peRatio: { type: Number },
  pbRatio: { type: Number },
  eps: { type: Number },
  dividendYield: { type: Number, default: 0 },
  revenueGrowth: { type: Number },
  netMargin: { type: Number },
  debtToEquity: { type: Number },
  roe: { type: Number },

  // Company info
  foundedYear: { type: Number },
  employees: { type: Number },
  headquarters: { type: String },
  website: { type: String },
  logoEmoji: { type: String, default: '🏢' },

  // Simulation config
  volatility: { type: Number, default: 0.02, min: 0 }, // daily std dev
  beta: { type: Number, default: 1.0 },
  trend: { type: Number, default: 0 }, // slight positive or negative bias
  seed: { type: Number }, // for reproducible random prices

  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

stockSchema.index({ sector: 1 });
stockSchema.index({ isActive: 1 });

module.exports = mongoose.model('Stock', stockSchema);
