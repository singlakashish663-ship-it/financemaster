const mongoose = require('mongoose');
const { Schema } = mongoose;

const achievementSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  emoji: { type: String, default: '🏅' },
  category: {
    type: String,
    enum: ['learning', 'trading', 'budgeting', 'streak', 'social', 'special', 'hidden'],
    required: true,
  },
  xpReward: { type: Number, default: 50, min: 0 },
  coinReward: { type: Number, default: 0, min: 0 },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  condition: {
    type: { type: String },
    threshold: Number,
    worldId: String,
    missionId: String,
  },
  isHidden: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const userAchievementSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = {
  Achievement: mongoose.model('Achievement', achievementSchema),
  UserAchievement: mongoose.model('UserAchievement', userAchievementSchema),
};
