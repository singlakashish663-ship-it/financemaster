const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const { UserAchievement } = require('../../models/Achievement');

router.get('/', authenticate, requireProfile, async (req, res, next) => {
  try {
    const achievements = await UserAchievement.find({ userId: req.user._id })
      .populate('achievementId').sort({ earnedAt: -1 });
    res.json({ achievements, xp: req.user.xp, level: req.user.level, coins: req.user.coins });
  } catch (err) { next(err); }
});

module.exports = router;
