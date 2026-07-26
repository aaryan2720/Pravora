const express = require('express');
const router = express.Router();
const { saveStep, completeOnboarding, getStatus } = require('../controllers/onboardingController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(protect, restrictTo('owner', 'manager'), tenantGuard);
router.post('/step', asyncHandler(saveStep));
router.post('/complete', asyncHandler(completeOnboarding));
router.get('/status', asyncHandler(getStatus));

module.exports = router;
