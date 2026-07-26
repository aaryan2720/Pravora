const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerProfile, toggleFavorite } = require('../controllers/membershipController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Staff: customer list and profiles
router.get('/customers', protect, tenantGuard, restrictTo('owner', 'manager', 'front_desk'), asyncHandler(getCustomers));
router.get('/customers/:id', protect, tenantGuard, asyncHandler(getCustomerProfile));

// Guest: toggle favorites (requires guest auth)
router.post('/favorites', protect, asyncHandler(toggleFavorite));

module.exports = router;
