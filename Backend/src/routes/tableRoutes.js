const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, deleteTable, resetTable, resolveQRToken, updateTableStatus, regenerateAllTokens } = require('../controllers/tableController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public — QR resolution (no auth, customer facing)
router.get('/qr/:token', asyncHandler(resolveQRToken));

// Protected
router.use(protect, tenantGuard);
router.get('/', asyncHandler(getTables));
router.post('/regenerate-tokens', restrictTo('owner', 'manager'), asyncHandler(regenerateAllTokens));
router.post('/', restrictTo('owner', 'manager'), asyncHandler(createTable));
router.put('/:id', restrictTo('owner', 'manager'), asyncHandler(updateTable));
router.delete('/:id', restrictTo('owner', 'manager'), asyncHandler(deleteTable));
router.post('/:id/reset', restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(resetTable));
router.patch('/:id/status', restrictTo('owner', 'manager', 'waiter', 'front_desk'), asyncHandler(updateTableStatus));

module.exports = router;
