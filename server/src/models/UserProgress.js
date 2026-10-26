const mongoose = require('mongoose');
const { Schema } = mongoose;

const missionProgressSchema = new Schema({
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
  worldId: { type: Schema.Types.ObjectId, ref: 'World', required: true },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0, min: 0, max: 100 },
  lastScore: { type: Number, default: 0 },
  completedAt: { type: Date },
  timeSpentSeconds: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
}, { _id: false });

const worldProgressSchema = new Schema({
  worldId: { type: Schema.Types.ObjectId, ref: 'World', required: true },
  worldSlug: { type: String, required: true },
  status: { type: String, enum: ['locked', 'unlocked', 'in-progress', 'completed'], default: 'locked' },
  completedMissions: { type: Number, default: 0 },
  totalMissions: { type: Number, default: 0 },
  masteryScore: { type: Number, default: 0, min: 0, max: 100 },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { _id: false });

const userProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true, unique: true },
  worlds: [worldProgressSchema],
  missions: [missionProgressSchema],
  totalMissionsCompleted: { type: Number, default: 0 },
  totalXPEarned: { type: Number, default: 0 },
  currentWorldId: { type: Schema.Types.ObjectId, ref: 'World' },
  currentMissionId: { type: Schema.Types.ObjectId, ref: 'Mission' },
  stockAcademyLevel: { type: Number, default: 0, min: 0, max: 10 },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

userProgressSchema.index({ userId: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
