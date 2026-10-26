const router = require('express').Router();
const { authenticate, requireProfile } = require('../../middleware/auth');
const UserProgress = require('../../models/UserProgress');
const { STOCK_ACADEMY_MODULES } = require('../../seeds/stockAcademyData');

const auth = [authenticate, requireProfile];

// GET /api/v1/stock-academy/modules
router.get('/modules', async (req, res, next) => {
  try {
    res.json({ modules: STOCK_ACADEMY_MODULES });
  } catch (err) { next(err); }
});

// GET /api/v1/stock-academy/lessons/:lessonId
router.get('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lesson = findLesson(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
    res.json({ lesson });
  } catch (err) { next(err); }
});

// POST /api/v1/stock-academy/lessons/:lessonId/complete
router.post('/lessons/:lessonId/complete', auth, async (req, res, next) => {
  try {
    const { score = 100 } = req.body;
    const lesson = findLesson(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const xpEarned = score >= 70 ? lesson.xpReward : 0;
    if (xpEarned > 0) await req.user.awardXP(xpEarned);

    await UserProgress.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { lastActivityAt: new Date() }, $max: { stockAcademyLevel: lesson.moduleNum } },
      { upsert: true }
    );

    res.json({ success: true, xpEarned, score });
  } catch (err) { next(err); }
});

// GET /api/v1/stock-academy/progress
router.get('/progress', auth, async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user._id });
    res.json({ currentLevel: progress?.stockAcademyLevel || 0 });
  } catch (err) { next(err); }
});

function findLesson(id) {
  for (const mod of STOCK_ACADEMY_MODULES) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return { ...lesson, moduleNum: mod.level };
  }
  return null;
}

module.exports = router;
