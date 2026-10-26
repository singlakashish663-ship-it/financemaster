const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/profile', require('./profile'));
router.use('/worlds', require('./worlds'));
router.use('/missions', require('./missions'));
router.use('/progress', require('./progress'));
router.use('/learning', require('./learning'));
router.use('/stock-academy', require('./stockAcademy'));
router.use('/market', require('./market'));
router.use('/paper-trading', require('./paperTrading'));
router.use('/calculators', require('./calculators'));
router.use('/quests', require('./quests'));
router.use('/rewards', require('./rewards'));
router.use('/dashboard', require('./dashboard'));
router.use('/leaderboard', require('./leaderboard'));
router.use('/admin', require('./admin'));

module.exports = router;
