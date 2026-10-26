const mongoose = require('mongoose');
const { Schema } = mongoose;

const watchlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true, unique: true },
  stocks: [{
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
    symbol: { type: String, required: true, uppercase: true },
    addedAt: { type: Date, default: Date.now },
    notes: { type: String, maxlength: 200 },
    alertPrice: { type: Number },
  }],
}, { timestamps: true });

watchlistSchema.index({ userId: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
