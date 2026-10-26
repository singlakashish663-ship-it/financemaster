const UserProfile = require('../models/UserProfile');
const UserPreferences = require('../models/UserPreferences');
const UserProgress = require('../models/UserProgress');
const VirtualPortfolio = require('../models/VirtualPortfolio');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * GET /api/v1/auth/me
 * Returns or creates the user profile for a Firebase-authenticated user.
 */
exports.getMe = async (req, res, next) => {
  try {
    let profile = await UserProfile.findOne({ firebaseUid: req.firebaseUid });

    if (!profile) {
      // Auto-create profile on first sign-in
      const username = await generateUsername(req.firebaseEmail);
      profile = await UserProfile.create({
        firebaseUid: req.firebaseUid,
        email: req.firebaseEmail,
        username,
        displayName: req.firebaseEmail?.split('@')[0] || 'Adventurer',
        emailVerified: false,
      });
      logger.info(`New user profile created: ${req.firebaseEmail}`);
    }

    res.json({ user: profile });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/onboarding
 * Save onboarding preferences and mark onboarding as complete.
 */
exports.saveOnboarding = async (req, res, next) => {
  try {
    const { avatar, learningPath, goals, dailyTime, difficulty, currency } = req.body;

    // Find or create profile (handles case where getMe hasn't been called yet)
    let profile = await UserProfile.findOne({ firebaseUid: req.firebaseUid });
    if (!profile) {
      const username = await generateUsername(req.firebaseEmail);
      profile = await UserProfile.create({
        firebaseUid: req.firebaseUid,
        email: req.firebaseEmail,
        username,
        displayName: req.firebaseEmail?.split('@')[0] || 'Adventurer',
        emailVerified: false,
      });
      logger.info(`Profile auto-created during onboarding: ${req.firebaseEmail}`);
    }

    // Update profile
    profile.avatar = avatar || profile.avatar;
    profile.onboardingCompleted = true;
    await profile.save();

    // Save preferences
    await UserPreferences.findOneAndUpdate(
      { userId: profile._id },
      {
        userId: profile._id,
        learningPath: learningPath || 'adult',
        goals: goals || [],
        dailyTimeMins: parseInt(dailyTime) || 10,
        difficulty: difficulty || 'medium',
        currency: currency || 'INR',
      },
      { upsert: true, new: true }
    );

    // Initialize user progress
    await UserProgress.findOneAndUpdate(
      { userId: profile._id },
      { userId: profile._id },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // Initialize virtual portfolio
    await VirtualPortfolio.findOneAndUpdate(
      { userId: profile._id },
      { userId: profile._id },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // Audit
    await AuditLog.create({
      userId: profile._id,
      action: 'ONBOARDING_COMPLETED',
      details: { learningPath, currency },
    });

    res.json({ success: true, user: profile });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/auth/account
 * Delete all user data.
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const profile = req.user;
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    // Soft-delete
    profile.deletedAt = new Date();
    profile.email = `deleted_${profile._id}@deleted.financequest`;
    await profile.save();

    await AuditLog.create({
      userId: profile._id,
      action: 'ACCOUNT_DELETED',
    });

    res.json({ success: true, message: 'Account scheduled for deletion.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/export
 * Export user data (GDPR-style).
 */
exports.exportData = async (req, res, next) => {
  try {
    const profile = req.user;
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const [prefs, progress, portfolio] = await Promise.all([
      UserPreferences.findOne({ userId: profile._id }),
      UserProgress.findOne({ userId: profile._id }),
      VirtualPortfolio.findOne({ userId: profile._id }),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      profile: {
        username: profile.username,
        email: profile.email,
        level: profile.level,
        xp: profile.xp,
        streak: profile.streak,
        createdAt: profile.createdAt,
      },
      preferences: prefs,
      progress: { totalMissionsCompleted: progress?.totalMissionsCompleted },
      portfolio: {
        cashBalance: portfolio?.cashBalance,
        totalTrades: portfolio?.totalTrades,
        realizedPnL: portfolio?.realizedPnL,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---- Helpers ----
async function generateUsername(email) {
  const base = email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'player';
  let username = base.substring(0, 20);
  let attempt = 0;
  while (await UserProfile.exists({ username })) {
    attempt++;
    username = `${base.substring(0, 16)}${attempt}`;
  }
  return username;
}
