const mongoose = require('mongoose');
const { Schema } = mongoose;

const worldSchema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  emoji: { type: String, default: '🌍' },
  order: { type: Number, required: true, unique: true },
  gradient: { type: String },
  accentColor: { type: String },
  topics: [{ type: String }],
  unlockRequirement: { type: String, default: null }, // slug of prerequisite world
  isPremium: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  xpReward: { type: Number, default: 500, min: 0 },
  missionCount: { type: Number, default: 0 },
  completionBadge: { type: String },
  npcMentor: {
    name: { type: String },
    emoji: { type: String },
    greeting: { type: String },
  },
  version: { type: Number, default: 1 },
}, { timestamps: true });

worldSchema.index({ isPublished: 1 });

module.exports = mongoose.model('World', worldSchema);
