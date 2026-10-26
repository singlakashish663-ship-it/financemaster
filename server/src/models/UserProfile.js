const mongoose = require('mongoose');
const { Schema } = mongoose;

const userProfileSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  displayName: { type: String, trim: true, maxlength: 50 },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  avatar: { type: String, default: 'explorer' },
  avatarCustomizations: {
    skin: { type: String, default: 'default' },
    outfit: { type: String, default: 'default' },
    accessory: { type: String, default: 'none' },
    trail: { type: String, default: 'none' },
    emote: { type: String, default: 'wave' },
  },
  xp: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  streak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  coins: { type: Number, default: 0, min: 0 },
  gems: { type: Number, default: 0, min: 0 },
  onboardingCompleted: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  bio: { type: String, maxlength: 200, default: '' },
  isPublic: { type: Boolean, default: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'UserProfile' }],
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'UserProfile' }],
  deletedAt: { type: Date },
}, { timestamps: true });

// Virtual: XP needed for next level
userProfileSchema.virtual('xpToNextLevel').get(function () {
  return this.level * 500;
});

// Virtual: XP progress within current level
userProfileSchema.virtual('xpProgress').get(function () {
  const baseXP = (this.level - 1) * 500;
  return this.xp - baseXP;
});

// Method: Award XP and level up
userProfileSchema.methods.awardXP = async function (amount) {
  this.xp += amount;
  const newLevel = Math.floor(this.xp / 500) + 1;
  const leveledUp = newLevel > this.level;
  this.level = newLevel;
  await this.save();
  return { newXP: this.xp, newLevel: this.level, leveledUp };
};

userProfileSchema.index({ username: 'text', displayName: 'text' });
userProfileSchema.index({ xp: -1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
