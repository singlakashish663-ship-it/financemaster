const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const { Quest, UserQuest } = require('../../models/Quest');
const AuditLog = require('../../models/AuditLog');

const auth = [authenticate, requireProfile];

// GET /api/v1/quests/today
router.get('/today', auth, async (req, res, next) => {
  try {
    const today  = new Date().toISOString().split('T')[0];
    const quests = await Quest.find({ isActive: true, type: 'daily' }).limit(5);

    const userQuests = await Promise.all(quests.map(async (q) => {
      let uq = await UserQuest.findOne({ userId: req.user._id, questId: q._id, date: today });
      if (!uq) uq = await UserQuest.create({ userId: req.user._id, questId: q._id, date: today, target: q.condition?.count || 1 });
      return { quest: q, progress: uq.progress, target: uq.target, completed: uq.completed, claimed: uq.claimed, userQuestId: uq._id };
    }));

    res.json({ quests: userQuests, date: today });
  } catch (err) { next(err); }
});

// POST /api/v1/quests/:questId/claim
router.post('/:questId/claim', auth, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const uq    = await UserQuest.findOne({ userId: req.user._id, questId: req.params.questId, date: today }).populate('questId');
    if (!uq)       return res.status(404).json({ error: 'Quest not found.' });
    if (!uq.completed) return res.status(400).json({ error: 'Quest not completed yet.' });
    if (uq.claimed)    return res.status(400).json({ error: 'Reward already claimed.' });

    const quest = uq.questId;
    const { newXP, newLevel, leveledUp } = await req.user.awardXP(quest.xpReward);

    uq.claimed = true; uq.claimedAt = new Date();
    await uq.save();

    await AuditLog.create({ userId: req.user._id, action: 'QUEST_CLAIMED', resourceId: quest._id, details: { xpReward: quest.xpReward } });

    res.json({ success: true, xpEarned: quest.xpReward, newXP, newLevel, leveledUp });
  } catch (err) { next(err); }
});

module.exports = router;
