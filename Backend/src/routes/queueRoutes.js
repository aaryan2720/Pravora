const express = require('express');
const router = express.Router();
const { getQueue, joinQueue, seatGuest, guestLeft } = require('../controllers/queueController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public: join queue (walk-in guest, no auth)
router.post('/', asyncHandler(joinQueue));
router.get('/public/:restaurantId', async (req, res) => {
  const QueueEntry = require('../models/QueueEntry');
  const { successResponse } = require('../utils/helpers');
  const entries = await QueueEntry.find({ restaurantId: req.params.restaurantId, status: 'waiting' }).sort('joinedAt').lean();
  return successResponse(res, { entries }, 'Queue retrieved');
});

// Staff
router.use(protect, tenantGuard);
router.get('/', asyncHandler(getQueue));
router.patch('/:id/seat', restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(seatGuest));
router.patch('/:id/leave', restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(guestLeft));

module.exports = router;
