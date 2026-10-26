const mongoose = require('mongoose');
const { Schema } = mongoose;

const userPreferencesSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true, unique: true },
  learningPath: {
    type: String,
    enum: ['school', 'college', 'first-job', 'adult'],
    default: 'adult',
  },
  goals: [{ type: String }],
  dailyTimeMins: { type: Number, default: 10, min: 5, max: 120 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  currency: { type: String, default: 'INR', maxlength: 5 },
  soundEnabled: { type: Boolean, default: true },
  musicEnabled: { type: Boolean, default: true },
  reducedMotion: { type: Boolean, default: false },
  notifications: {
    dailyReminder: { type: Boolean, default: true },
    streakAlert: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: false },
  },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  reminderTime: { type: String, default: '20:00' },
}, { timestamps: true });

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
