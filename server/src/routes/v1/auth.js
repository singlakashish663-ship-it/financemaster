const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const authController = require('../../controllers/authController');

// GET /api/v1/auth/me — get or create user profile
router.get('/me', authenticate, authController.getMe);

// POST /api/v1/auth/onboarding — save onboarding preferences
router.post('/onboarding', authenticate, authController.saveOnboarding);

// DELETE /api/v1/auth/account — delete account
router.delete('/account', authenticate, authController.deleteAccount);

// POST /api/v1/auth/export — export user data
router.post('/export', authenticate, authController.exportData);

module.exports = router;
