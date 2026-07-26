const express = require('express');
const router = express.Router();
const { getReservations, createReservation, getReservation, updateReservationStatus, cancelReservation } = require('../controllers/reservationController');
const { protect, restrictTo, tenantGuard, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public: create reservation (customer or staff can create)
router.post('/', optionalAuth, asyncHandler(createReservation));
router.get('/:id', optionalAuth, asyncHandler(getReservation));

// Staff only
router.use(protect, tenantGuard);
router.get('/', asyncHandler(getReservations));
router.patch('/:id/status', restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(updateReservationStatus));
router.delete('/:id', restrictTo('owner', 'manager', 'front_desk'), asyncHandler(cancelReservation));

module.exports = router;
