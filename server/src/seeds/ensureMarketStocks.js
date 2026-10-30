'use strict';

const Stock = require('../models/Stock');

// Keep the paper market available on fresh deployments where the manual seed
// command has not been run yet. Only missing symbols are inserted; existing
// prices, user holdings, and stock configuration are left untouched.
const MARKET_STOCKS = [
  { symbol: 'NVT', name: 'NovaTech Industries', sector: 'Technology', description: 'A fictional diversified technology company focused on software and cloud services.', currentPrice: 847, previousClose: 820, openPrice: 825, dayHigh: 860, dayLow: 815, volume: 2450000, marketCap: 84700000000, peRatio: 28.5, pbRatio: 4.2, eps: 29.7, dividendYield: 0.5, revenueGrowth: 22, netMargin: 18, debtToEquity: 0.3, roe: 22, foundedYear: 2010, employees: 12000, headquarters: 'Bengaluru', logoEmoji: '💻', volatility: 0.025, beta: 1.2, trend: 0.0003, seed: 1001 },
  { symbol: 'GRB', name: 'GrowthBank Ltd', sector: 'Finance', description: 'A fictional mid-sized private bank serving retail and SME customers.', currentPrice: 1234, previousClose: 1250, openPrice: 1245, dayHigh: 1260, dayLow: 1220, volume: 1800000, marketCap: 123400000000, peRatio: 14.2, pbRatio: 1.8, eps: 86.9, dividendYield: 1.2, revenueGrowth: 12, netMargin: 22, debtToEquity: 5.5, roe: 14, foundedYear: 1998, employees: 28000, headquarters: 'Mumbai', logoEmoji: '🏦', volatility: 0.018, beta: 0.9, trend: -0.00005, seed: 1002 },
  { symbol: 'ECO', name: 'EcoEnergy Corp', sector: 'Energy', description: 'A fictional renewable energy company in solar and wind power.', currentPrice: 567, previousClose: 536, openPrice: 545, dayHigh: 580, dayLow: 538, volume: 3200000, marketCap: 56700000000, peRatio: 35.1, pbRatio: 3.6, eps: 16.1, dividendYield: 0, revenueGrowth: 38, netMargin: 12, debtToEquity: 0.8, roe: 11, foundedYear: 2015, employees: 6500, headquarters: 'Pune', logoEmoji: '☀️', volatility: 0.035, beta: 1.5, trend: 0.0005, seed: 1003 },
  { symbol: 'URT', name: 'UrbanRetail Pvt', sector: 'Consumer', description: 'A fictional multi-format retail chain across Tier 1 and Tier 2 Indian cities.', currentPrice: 890, previousClose: 882, openPrice: 885, dayHigh: 905, dayLow: 878, volume: 1200000, marketCap: 89000000000, peRatio: 31.4, pbRatio: 5.1, eps: 28.3, dividendYield: 0.8, revenueGrowth: 15, netMargin: 8, debtToEquity: 0.4, roe: 18, foundedYear: 2008, employees: 45000, headquarters: 'Delhi', logoEmoji: '🛒', volatility: 0.022, beta: 0.85, trend: 0.0001, seed: 1004 },
  { symbol: 'HLF', name: 'HealthFirst Ltd', sector: 'Healthcare', description: 'A fictional chain of hospitals and diagnostic centres.', currentPrice: 3456, previousClose: 3470, openPrice: 3465, dayHigh: 3490, dayLow: 3440, volume: 560000, marketCap: 345600000000, peRatio: 42, pbRatio: 6.8, eps: 82.3, dividendYield: 0.3, revenueGrowth: 18, netMargin: 14, debtToEquity: 0.2, roe: 16, foundedYear: 2001, employees: 35000, headquarters: 'Chennai', logoEmoji: '🏥', volatility: 0.015, beta: 0.7, trend: 0.0002, seed: 1005 },
  { symbol: 'TVN', name: 'TechVenture Inc', sector: 'Technology', description: 'A fictional early-stage tech company developing AI-based business tools.', currentPrice: 1890, previousClose: 1850, openPrice: 1860, dayHigh: 1930, dayLow: 1840, volume: 890000, marketCap: 189000000000, peRatio: 85, pbRatio: 12.3, eps: 22.2, dividendYield: 0, revenueGrowth: 65, netMargin: 8, debtToEquity: 0.1, roe: 14, foundedYear: 2018, employees: 3500, headquarters: 'Hyderabad', logoEmoji: '🤖', volatility: 0.045, beta: 1.8, trend: 0.0006, seed: 1006 },
  { symbol: 'MTC', name: 'MetalCorp Ltd', sector: 'Materials', description: 'A fictional steel and aluminium producer for industrial use.', currentPrice: 456, previousClose: 467, openPrice: 463, dayHigh: 470, dayLow: 448, volume: 2800000, marketCap: 45600000000, peRatio: 9.8, pbRatio: 1.1, eps: 46.5, dividendYield: 2.8, revenueGrowth: 5, netMargin: 7, debtToEquity: 1.2, roe: 11, foundedYear: 1975, employees: 22000, headquarters: 'Jamshedpur', logoEmoji: '⚙️', volatility: 0.03, beta: 1.1, trend: -0.0002, seed: 1007 },
  { symbol: 'FBK', name: 'FoodBasket FMCG', sector: 'Consumer', description: 'A fictional FMCG company manufacturing packaged foods and personal care products.', currentPrice: 234, previousClose: 230, openPrice: 231, dayHigh: 238, dayLow: 228, volume: 4100000, marketCap: 23400000000, peRatio: 52, pbRatio: 8.4, eps: 4.5, dividendYield: 1.5, revenueGrowth: 9, netMargin: 16, debtToEquity: 0.05, roe: 35, foundedYear: 1965, employees: 18000, headquarters: 'Kolkata', logoEmoji: '🍱', volatility: 0.012, beta: 0.55, trend: 0.00015, seed: 1008 },
  { symbol: 'INS', name: 'InsureMax Ltd', sector: 'Finance', description: 'A fictional life and general insurance company.', currentPrice: 678, previousClose: 672, openPrice: 674, dayHigh: 685, dayLow: 669, volume: 980000, marketCap: 67800000000, peRatio: 22.3, pbRatio: 2.9, eps: 30.4, dividendYield: 0.9, revenueGrowth: 16, netMargin: 12, debtToEquity: 0.8, roe: 13, foundedYear: 2005, employees: 15000, headquarters: 'Mumbai', logoEmoji: '🛡️', volatility: 0.02, beta: 0.8, trend: 0.0001, seed: 1009 },
  { symbol: 'RWL', name: 'RealWorld Infra', sector: 'Real Estate', description: 'A fictional real estate developer of residential and commercial projects.', currentPrice: 345, previousClose: 340, openPrice: 342, dayHigh: 355, dayLow: 338, volume: 1600000, marketCap: 34500000000, peRatio: 18.5, pbRatio: 2.1, eps: 18.6, dividendYield: 1.8, revenueGrowth: 11, netMargin: 20, debtToEquity: 1.5, roe: 12, foundedYear: 1990, employees: 8000, headquarters: 'Gurugram', logoEmoji: '🏗️', volatility: 0.028, beta: 1, trend: 0.0001, seed: 1010 },
].map((stock) => ({
  ...stock,
  isActive: true,
  isFictional: true,
  dataSource: 'synthetic',
}));

async function ensureMarketStocks() {
  await Stock.bulkWrite(MARKET_STOCKS.map((stock) => ({
    updateOne: {
      filter: { symbol: stock.symbol },
      update: { $setOnInsert: stock },
      upsert: true,
    },
  })));
}

module.exports = ensureMarketStocks;
