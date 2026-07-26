const express = require('express');
const router = express.Router();
const { getTodayAnalytics, getWeekAnalytics, getMonthAnalytics, getPulse } = require('../controllers/analyticsController');
const { protect, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(protect, tenantGuard);
router.get('/today', asyncHandler(getTodayAnalytics));
router.get('/week', asyncHandler(getWeekAnalytics));
router.get('/month', asyncHandler(getMonthAnalytics));
router.get('/pulse', asyncHandler(getPulse));

module.exports = router;
