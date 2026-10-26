const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const UserProgress = require('../../models/UserProgress');
const UserPreferences = require('../../models/UserPreferences');
const Mission = require('../../models/Mission');
const World = require('../../models/World');

router.get('/recommendations', authenticate, requireProfile, async (req, res, next) => {
  try {
    const [progress, prefs] = await Promise.all([
      UserProgress.findOne({ userId: req.user._id }),
      UserPreferences.findOne({ userId: req.user._id }),
    ]);

    const completedIds = new Set(
      (progress?.missions || [])
        .filter((m) => m.status === 'completed')
        .map((m) => m.missionId.toString())
    );

    // Find the next uncompleted mission in order
    const worlds = await World.find({ isPublished: true }).sort({ order: 1 });
    const recommendations = [];

    for (const world of worlds.slice(0, 5)) {
      const missions = await Mission.find({ worldId: world._id, isPublished: true })
        .sort({ order: 1 })
        .limit(3);
      
      for (const m of missions) {
        if (!completedIds.has(m._id.toString())) {
          recommendations.push({
            mission: m,
            world: { name: world.name, slug: world.slug, emoji: world.emoji },
            reason: completedIds.size === 0 ? 'Start here' : 'Continue learning',
          });
          if (recommendations.length >= 5) break;
        }
      }
      if (recommendations.length >= 5) break;
    }

    res.json({ recommendations });
  } catch (err) { next(err); }
});

module.exports = router;
