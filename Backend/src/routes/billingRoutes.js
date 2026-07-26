const express = require('express');
const router = express.Router();
const { generateBill, getBill, markPaid } = require('../controllers/billingController');
const { protect, restrictTo, tenantGuard, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get bill: public (customer can view their bill by sessionId)
router.get('/:sessionId', optionalAuth, asyncHandler(getBill));

// Generate bill: staff or system
router.post('/generate', protect, tenantGuard, restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(generateBill));

// Mark paid: staff only
router.patch('/:billId/pay', protect, tenantGuard, restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(markPaid));

module.exports = router;
