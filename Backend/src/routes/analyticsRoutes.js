const express = require('express');
const router = express.Router();
const { getTodayAnalytics, getWeekAnalytics, getMonthAnalytics, getPulse, getSaaSAnalytics } = require('../controllers/analyticsController');
const { protect, tenantGuard, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/saas', protect, restrictTo('admin'), asyncHandler(getSaaSAnalytics));

router.use(protect, tenantGuard);
router.get('/today', asyncHandler(getTodayAnalytics));
router.get('/week', asyncHandler(getWeekAnalytics));
router.get('/month', asyncHandler(getMonthAnalytics));
router.get('/pulse', asyncHandler(getPulse));

module.exports = router;
