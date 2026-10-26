const mongoose = require('mongoose');
const { Schema } = mongoose;

const missionSchema = new Schema({
  worldId:  { type: Schema.Types.ObjectId, ref: 'World', required: true },
  worldSlug: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['lesson', 'quiz', 'game', 'simulation', 'calculator', 'challenge', 'story'],
    default: 'lesson',
  },
  order: { type: Number, required: true },
  xpReward: { type: Number, default: 50, min: 0 },
  coinReward: { type: Number, default: 10, min: 0 },
  timeEstimateMins: { type: Number, default: 5 },
  isPremium: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  unlockRequirement: { type: Schema.Types.ObjectId, ref: 'Mission', default: null },

  // Lesson content
  content: {
    sections: [{
      type: { type: String, enum: ['text', 'image', 'video', 'interactive', 'code'] },
      title: String,
      body: String,
      tip: String,
      imageUrl: String,
    }],
    keyTakeaways: [String],
  },

  // Quiz / interaction
  questions: [{
    id: String,
    type: {
      type: String,
      enum: ['mcq', 'true-false', 'fill-blank', 'match', 'order', 'scenario', 'drag-drop'],
    },
    question: String,
    options: [{ id: String, text: String }],
    correctAnswer: Schema.Types.Mixed,
    explanation: String,
    conceptTag: String,
    points: { type: Number, default: 10 },
  }],

  // Game scenario config
  gameConfig: {
    levelId: String,
    scenarioData: Schema.Types.Mixed,
  },

  completionConditions: {
    minScore: { type: Number, default: 70 },
    requireAllQuestions: { type: Boolean, default: false },
    minTimeSeconds: { type: Number, default: 0 },
  },

  version: { type: Number, default: 1 },
  tags: [String],
}, { timestamps: true });

missionSchema.index({ worldId: 1, order: 1 });
missionSchema.index({ worldSlug: 1, order: 1 });
missionSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Mission', missionSchema);
