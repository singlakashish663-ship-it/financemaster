const mongoose = require('mongoose');
const { Schema } = mongoose;

const questSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  emoji: { type: String, default: '⭐' },
  type: { type: String, enum: ['daily', 'weekly', 'special'], default: 'daily' },
  xpReward: { type: Number, default: 100, min: 0 },
  coinReward: { type: Number, default: 20, min: 0 },
  condition: {
    type: { type: String },
    count: { type: Number, default: 1 },
    worldSlug: String,
    missionType: String,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const userQuestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  questId: { type: Schema.Types.ObjectId, ref: 'Quest', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  progress: { type: Number, default: 0 },
  target: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date },
}, { timestamps: true });

userQuestSchema.index({ userId: 1, date: 1 });
userQuestSchema.index({ userId: 1, questId: 1, date: 1 }, { unique: true });

module.exports = {
  Quest: mongoose.model('Quest', questSchema),
  UserQuest: mongoose.model('UserQuest', userQuestSchema),
};
