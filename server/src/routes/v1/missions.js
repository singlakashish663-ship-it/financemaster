const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const Mission = require('../../models/Mission');
const UserProgress = require('../../models/UserProgress');
const UserProfile = require('../../models/UserProfile');
const { Quest: QuestModel, UserQuest } = require('../../models/Quest');
const AuditLog = require('../../models/AuditLog');

// GET /api/v1/missions/:missionId
router.get('/:missionId', authenticate, async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.missionId);
    if (!mission || !mission.isPublished) return res.status(404).json({ error: 'Mission not found.' });
    res.json({ mission });
  } catch (err) { next(err); }
});

// POST /api/v1/missions/:missionId/start
router.post('/:missionId/start', authenticate, requireProfile, async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.missionId);
    if (!mission || !mission.isPublished) return res.status(404).json({ error: 'Mission not found.' });

    // Update progress
    await UserProgress.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          currentMissionId: mission._id,
          lastActivityAt: new Date(),
        },
        $setOnInsert: { userId: req.user._id },
      },
      { upsert: true }
    );

    res.json({ success: true, mission });
  } catch (err) { next(err); }
});

// POST /api/v1/missions/:missionId/complete
router.post('/:missionId/complete', authenticate, requireProfile, async (req, res, next) => {
  try {
    const { score = 100, timeSpentSeconds = 0 } = req.body;
    const mission = await Mission.findById(req.params.missionId);
    if (!mission) return res.status(404).json({ error: 'Mission not found.' });

    const minScore = mission.completionConditions?.minScore || 70;
    const passed = score >= minScore;

    let xpEarned = 0;
    let leveledUp = false;

    if (passed) {
      const progress = await UserProgress.findOne({ userId: req.user._id });

      // Check if already completed
      const existingMission = progress?.missions?.find(
        (m) => m.missionId.toString() === mission._id.toString()
      );
      const alreadyCompleted = existingMission?.status === 'completed';

      // Update mission record
      await UserProgress.findOneAndUpdate(
        { userId: req.user._id, 'missions.missionId': mission._id },
        {
          $set: {
            'missions.$.status': 'completed',
            'missions.$.bestScore': Math.max(existingMission?.bestScore || 0, score),
            'missions.$.lastScore': score,
            'missions.$.completedAt': new Date(),
            'missions.$.timeSpentSeconds': timeSpentSeconds,
          },
        }
      );

      if (!await UserProgress.exists({ userId: req.user._id, 'missions.missionId': mission._id })) {
        await UserProgress.findOneAndUpdate(
          { userId: req.user._id },
          {
            $push: {
              missions: {
                missionId: mission._id,
                worldId: mission.worldId,
                status: 'completed',
                attempts: 1,
                bestScore: score,
                lastScore: score,
                completedAt: new Date(),
                timeSpentSeconds,
                xpEarned: mission.xpReward,
              },
            },
            $inc: { totalMissionsCompleted: alreadyCompleted ? 0 : 1 },
            $set: { lastActivityAt: new Date() },
          },
          { upsert: true }
        );
      }

      // Award XP only once per mission
      if (!alreadyCompleted) {
        xpEarned = mission.xpReward;
        const result = await req.user.awardXP(xpEarned);
        leveledUp = result.leveledUp;
      }
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'MISSION_COMPLETED',
      resourceId: mission._id,
      details: { score, passed, xpEarned },
    });

    res.json({
      success: true,
      passed,
      score,
      xpEarned,
      leveledUp,
      message: passed
        ? `Great work! You earned ${xpEarned} XP.`
        : `Score ${score}% — you need ${minScore}% to pass. Try again!`,
    });
  } catch (err) { next(err); }
});

module.exports = router;
