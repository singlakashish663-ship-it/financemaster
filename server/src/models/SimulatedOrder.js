const mongoose = require('mongoose');
const { Schema } = mongoose;

const simulatedOrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
  symbol: { type: String, required: true, uppercase: true },
  orderType: { type: String, enum: ['market', 'limit', 'stop-loss'], required: true },
  side: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  limitPrice: { type: Number, min: 0 },
  stopPrice: { type: Number, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'executed', 'cancelled', 'rejected', 'partially-filled'],
    default: 'pending',
  },
  executedPrice: { type: Number, min: 0 },
  executedQuantity: { type: Number, default: 0 },
  executedAt: { type: Date },
  transactionCost: { type: Number, default: 0, min: 0 },
  totalValue: { type: Number, min: 0 }, // quantity * executedPrice
  rejectionReason: { type: String },
  idempotencyKey: { type: String, unique: true, sparse: true },
  notes: { type: String, maxlength: 500 },
}, { timestamps: true });

simulatedOrderSchema.index({ userId: 1, createdAt: -1 });
simulatedOrderSchema.index({ symbol: 1 });
simulatedOrderSchema.index({ status: 1 });

module.exports = mongoose.model('SimulatedOrder', simulatedOrderSchema);
