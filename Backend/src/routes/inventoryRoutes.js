const express = require('express');
const router = express.Router();
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(protect, tenantGuard);
router.get('/', asyncHandler(getInventory));
router.post('/', restrictTo('owner', 'manager'), asyncHandler(createInventoryItem));
router.put('/:id', restrictTo('owner', 'manager', 'kitchen'), asyncHandler(updateInventoryItem));
router.delete('/:id', restrictTo('owner', 'manager'), asyncHandler(deleteInventoryItem));

module.exports = router;
