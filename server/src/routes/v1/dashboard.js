const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const UserProgress    = require('../../models/UserProgress');
const UserPreferences = require('../../models/UserPreferences');
const VirtualPortfolio= require('../../models/VirtualPortfolio');
const { UserAchievement } = require('../../models/Achievement');
const { Quest, UserQuest } = require('../../models/Quest');

router.get('/', authenticate, requireProfile, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [progress, prefs, portfolio, recentAchievements, dailyQuests] = await Promise.all([
      UserProgress.findOne({ userId: req.user._id }),
      UserPreferences.findOne({ userId: req.user._id }),
      VirtualPortfolio.findOne({ userId: req.user._id }),
      UserAchievement.find({ userId: req.user._id }).sort({ earnedAt: -1 }).limit(5).populate('achievementId', 'title emoji rarity'),
      Quest.find({ isActive: true, type: 'daily' }).limit(3),
    ]);

    const questStates = await Promise.all(dailyQuests.map(async (q) => {
      const uq = await UserQuest.findOne({ userId: req.user._id, questId: q._id, date: today });
      return { quest: q, completed: uq?.completed || false, claimed: uq?.claimed || false, progress: uq?.progress || 0, target: uq?.target || 1 };
    }));

    res.json({
      user: {
        username: req.user.username, displayName: req.user.displayName, avatar: req.user.avatar,
        level: req.user.level, xp: req.user.xp, xpToNextLevel: req.user.level * 500,
        streak: req.user.streak, coins: req.user.coins, isPremium: req.user.isPremium,
      },
      progress: {
        totalMissionsCompleted: progress?.totalMissionsCompleted || 0,
        stockAcademyLevel:      progress?.stockAcademyLevel || 0,
        worldsStarted:          (progress?.worlds || []).filter((w) => w.status !== 'locked').length,
      },
      portfolio: portfolio ? {
        cashBalance:    portfolio.cashBalance,
        portfolioValue: portfolio.portfolioValue,
        totalReturn:    +(portfolio.portfolioValue - portfolio.initialBalance).toFixed(2),
        totalTrades:    portfolio.totalTrades,
      } : null,
      quests: questStates,
      recentAchievements,
      preferences: prefs,
    });
  } catch (err) { next(err); }
});

module.exports = router;
