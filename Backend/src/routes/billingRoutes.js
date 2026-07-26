const express = require('express');
const router = express.Router();
const { generateBill, getBill, markPaid } = require('../controllers/billingController');
const { protect, restrictTo, tenantGuard, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get bill: public (customer can view their bill by sessionId)
router.get('/:sessionId', optionalAuth, asyncHandler(getBill));

// Generate bill: staff or customer
router.post('/generate', optionalAuth, tenantGuard, asyncHandler(generateBill));

// Mark paid: staff or customer guest
router.patch('/:billId/pay', protect, tenantGuard, asyncHandler(markPaid));

module.exports = router;
