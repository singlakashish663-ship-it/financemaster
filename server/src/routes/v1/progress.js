const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const UserProgress = require('../../models/UserProgress');
const { UserAchievement } = require('../../models/Achievement');

const auth = [authenticate, requireProfile];

router.get('/me', auth, async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user._id })
      .populate('worlds.worldId', 'name slug emoji order')
      .populate('currentWorldId', 'name slug')
      .populate('currentMissionId', 'title type');
    res.json({ progress });
  } catch (err) { next(err); }
});

router.get('/mastery', auth, async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user._id });
    const achievements = await UserAchievement.find({ userId: req.user._id })
      .populate('achievementId', 'title emoji rarity');
    res.json({ mastery: progress?.worlds || [], achievements });
  } catch (err) { next(err); }
});

router.get('/history', auth, async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user._id });
    const completedMissions = (progress?.missions || []).filter((m) => m.status === 'completed');
    res.json({ history: completedMissions });
  } catch (err) { next(err); }
});

module.exports = router;
