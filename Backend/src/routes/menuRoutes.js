const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getPublicMenu, getItems, createItem, updateItem,
  updateAvailability, updatePrice, deleteItem, uploadItemImage,
} = require('../controllers/menuController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public
router.get('/restaurant/:restaurantId', asyncHandler(getPublicMenu));

// Protected — all require auth + tenant isolation
router.use(protect, tenantGuard);

router.get('/categories', asyncHandler(getCategories));
router.post('/categories', restrictTo('owner', 'manager'), asyncHandler(createCategory));
router.put('/categories/:id', restrictTo('owner', 'manager'), asyncHandler(updateCategory));
router.delete('/categories/:id', restrictTo('owner', 'manager'), asyncHandler(deleteCategory));

router.get('/items', asyncHandler(getItems));
router.post('/items', restrictTo('owner', 'manager'), asyncHandler(createItem));
router.put('/items/:id', restrictTo('owner', 'manager'), asyncHandler(updateItem));
router.patch('/items/:id/availability', restrictTo('owner', 'manager', 'waiter', 'kitchen'), asyncHandler(updateAvailability));
router.patch('/items/:id/price', restrictTo('owner', 'manager'), asyncHandler(updatePrice));
router.delete('/items/:id', restrictTo('owner', 'manager'), asyncHandler(deleteItem));
router.post('/items/:id/image', restrictTo('owner', 'manager'), upload.single('image'), asyncHandler(uploadItemImage));

module.exports = router;
