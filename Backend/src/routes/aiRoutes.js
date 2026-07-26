const express = require('express');
const router = express.Router();
const { onboardingSummary, menuInsights, operationsSummary, customerRecommendation } = require('../controllers/aiController');
const { protect, tenantGuard, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Staff AI routes
router.use(protect, tenantGuard);
router.post('/onboarding-summary', asyncHandler(onboardingSummary));
router.post('/menu-insights', asyncHandler(menuInsights));
router.post('/operations-summary', asyncHandler(operationsSummary));

// Customer recommendation: optionalAuth
router.post('/recommendation', optionalAuth, asyncHandler(customerRecommendation));

module.exports = router;
