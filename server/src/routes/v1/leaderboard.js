const router = require('express').Router();
const { optionalAuth } = require('../../middleware/auth');
const UserProfile = require('../../models/UserProfile');

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const n = Math.min(parseInt(limit) || 50, 100);

    // Only expose display names / aliases — never emails
    const leaders = await UserProfile.find({ deletedAt: null, isPublic: true })
      .select('username displayName avatar level xp streak')
      .sort({ xp: -1 }).limit(n);

    const sanitized = leaders.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      displayName: u.displayName || u.username,
      avatar: u.avatar,
      level: u.level,
      xp: u.xp,
      streak: u.streak,
      isCurrentUser: req.user?._id.toString() === u._id.toString(),
    }));

    res.json({ leaderboard: sanitized, total: sanitized.length });
  } catch (err) { next(err); }
});

module.exports = router;
