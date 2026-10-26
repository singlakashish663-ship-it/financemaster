const mongoose = require('mongoose');
const { Schema } = mongoose;

const tradeTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'SimulatedOrder', required: true },
  stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
  symbol: { type: String, required: true, uppercase: true },
  side: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  totalValue: { type: Number, required: true },
  transactionCost: { type: Number, default: 0, min: 0 },
  netValue: { type: Number }, // totalValue - transactionCost (for buys)
  cashBefore: { type: Number, required: true },
  cashAfter: { type: Number, required: true },
  realizedPnL: { type: Number, default: 0 }, // for sells
  averageBuyPrice: { type: Number }, // recorded for sells
  notes: { type: String, maxlength: 500 },
}, { timestamps: true });

tradeTransactionSchema.index({ userId: 1, createdAt: -1 });
tradeTransactionSchema.index({ symbol: 1 });

module.exports = mongoose.model('TradeTransaction', tradeTransactionSchema);
