const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const World = require('../../models/World');
const Mission = require('../../models/Mission');

// GET /api/v1/worlds
router.get('/', async (req, res, next) => {
  try {
    const worlds = await World.find({ isPublished: true }).sort({ order: 1 });
    res.json({ worlds });
  } catch (err) { next(err); }
});

// GET /api/v1/worlds/:worldId
router.get('/:worldId', async (req, res, next) => {
  try {
    const wid = req.params.worldId;
    let world;
    if (isValidObjectId(wid)) {
      world = await World.findOne({ $or: [{ _id: wid }, { slug: wid }], isPublished: true });
    } else {
      world = await World.findOne({ slug: wid, isPublished: true });
    }
    if (!world) return res.status(404).json({ error: 'World not found.' });
    res.json({ world });
  } catch (err) { next(err); }
});

// Helper: check if string is a valid MongoDB ObjectId
const mongoose = require('mongoose');
function isValidObjectId(id) {
  return mongoose.isValidObjectId(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

// GET /api/v1/worlds/:worldId/missions — list missions for a world
router.get('/:worldId/missions', async (req, res, next) => {
  try {
    const wid = req.params.worldId;
    let world;
    if (isValidObjectId(wid)) {
      world = await World.findOne({ $or: [{ _id: wid }, { slug: wid }] });
    } else {
      world = await World.findOne({ slug: wid });
    }
    if (!world) return res.status(404).json({ error: 'World not found.' });
    const missions = await Mission.find({ worldId: world._id, isPublished: true }).sort({ order: 1 }).select('-__v');
    res.json({ missions, world: { name: world.name, slug: world.slug, emoji: world.emoji } });
  } catch (err) { next(err); }
});

// GET /api/v1/worlds/:worldId/missions/:missionOrder — get mission by order number
router.get('/:worldId/missions/:missionOrder', async (req, res, next) => {
  try {
    const wid = req.params.worldId;
    let world;
    if (isValidObjectId(wid)) {
      world = await World.findOne({ $or: [{ _id: wid }, { slug: wid }] });
    } else {
      world = await World.findOne({ slug: wid });
    }
    if (!world) return res.status(404).json({ error: 'World not found.' });
    const order = parseInt(req.params.missionOrder);
    if (isNaN(order)) return res.status(400).json({ error: 'Invalid mission order.' });
    const mission = await Mission.findOne({ worldId: world._id, order, isPublished: true });
    if (!mission) return res.status(404).json({ error: 'Mission not found.' });
    res.json({ mission, world: { name: world.name, slug: world.slug, emoji: world.emoji } });
  } catch (err) { next(err); }
});

module.exports = router;
