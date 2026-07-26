const express = require('express');
const router = express.Router();
const { getOrders, placeOrder, getOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, restrictTo, tenantGuard, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Place order: optionalAuth (customer, no login required)
router.post('/', optionalAuth, asyncHandler(placeOrder));
router.get('/:id', optionalAuth, asyncHandler(getOrder));

// Staff routes
router.use(protect, tenantGuard);
router.get('/', asyncHandler(getOrders));
router.patch('/:id/status', restrictTo('owner', 'manager', 'waiter', 'kitchen'), asyncHandler(updateOrderStatus));
router.delete('/:id', restrictTo('owner', 'manager', 'waiter'), asyncHandler(cancelOrder));

module.exports = router;
