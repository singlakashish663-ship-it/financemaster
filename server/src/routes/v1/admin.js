const router = require('express').Router();
const { authenticate, requireAdmin } = require('../../middleware/auth');
const World       = require('../../models/World');
const Mission     = require('../../models/Mission');
const Stock       = require('../../models/Stock');
const UserProfile = require('../../models/UserProfile');
const AuditLog    = require('../../models/AuditLog');
const { Achievement } = require('../../models/Achievement');

const guard = [authenticate, requireAdmin];

// Analytics
router.get('/analytics', guard, async (req, res, next) => {
  try {
    const [totalUsers, totalWorlds, totalMissions, totalStocks] = await Promise.all([
      UserProfile.countDocuments({ deletedAt: null }),
      World.countDocuments(),
      Mission.countDocuments(),
      Stock.countDocuments({ isActive: true }),
    ]);
    res.json({ analytics: { totalUsers, totalWorlds, totalMissions, totalStocks } });
  } catch (err) { next(err); }
});

// Worlds CRUD
router.get('/worlds', guard, async (req, res, next) => {
  try { res.json({ worlds: await World.find().sort({ order: 1 }) }); } catch (err) { next(err); }
});
router.post('/worlds', guard, async (req, res, next) => {
  try {
    const world = await World.create(req.body);
    await AuditLog.create({ userId: req.user._id, action: 'WORLD_CREATED', resourceId: world._id });
    res.status(201).json({ world });
  } catch (err) { next(err); }
});
router.patch('/worlds/:id', guard, async (req, res, next) => {
  try {
    const world = await World.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!world) return res.status(404).json({ error: 'World not found.' });
    await AuditLog.create({ userId: req.user._id, action: 'WORLD_UPDATED', resourceId: world._id });
    res.json({ world });
  } catch (err) { next(err); }
});

// Missions CRUD
router.get('/missions', guard, async (req, res, next) => {
  try {
    const q = req.query.worldId ? { worldId: req.query.worldId } : {};
    res.json({ missions: await Mission.find(q).sort({ order: 1 }).populate('worldId', 'name slug') });
  } catch (err) { next(err); }
});
router.post('/missions', guard, async (req, res, next) => {
  try {
    const mission = await Mission.create(req.body);
    await World.findByIdAndUpdate(mission.worldId, { $inc: { missionCount: 1 } });
    res.status(201).json({ mission });
  } catch (err) { next(err); }
});
router.patch('/missions/:id', guard, async (req, res, next) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mission) return res.status(404).json({ error: 'Mission not found.' });
    res.json({ mission });
  } catch (err) { next(err); }
});

// Stocks
router.get('/stocks', guard, async (req, res, next) => {
  try { res.json({ stocks: await Stock.find().sort({ symbol: 1 }) }); } catch (err) { next(err); }
});
router.patch('/stocks/:id', guard, async (req, res, next) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) return res.status(404).json({ error: 'Stock not found.' });
    res.json({ stock });
  } catch (err) { next(err); }
});

// Users list
router.get('/users', guard, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const [users, total] = await Promise.all([
      UserProfile.find({ deletedAt: null }).select('username email level xp isPremium createdAt role')
        .sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)),
      UserProfile.countDocuments({ deletedAt: null }),
    ]);
    res.json({ users, total, page: parseInt(page) });
  } catch (err) { next(err); }
});

// Audit logs
router.get('/audit-logs', guard, async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).populate('userId', 'username email');
    res.json({ logs });
  } catch (err) { next(err); }
});

module.exports = router;
