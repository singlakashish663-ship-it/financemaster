const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const UserProfile = require('../../models/UserProfile');
const UserPreferences = require('../../models/UserPreferences');

router.get('/', authenticate, requireProfile, async (req, res, next) => {
  try {
    const prefs = await UserPreferences.findOne({ userId: req.user._id });
    res.json({ profile: req.user, preferences: prefs });
  } catch (err) { next(err); }
});

router.patch('/', authenticate, requireProfile, async (req, res, next) => {
  try {
    const allowed = ['displayName', 'bio', 'isPublic', 'avatar', 'avatarCustomizations'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const profile = await UserProfile.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ profile });
  } catch (err) { next(err); }
});

module.exports = router;
