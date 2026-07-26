const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  listRestaurants,
  getRestaurantBySlug,
  getRestaurantById,
  updateRestaurant,
  toggleLive,
  uploadLogo,
  uploadCover,
} = require('../controllers/restaurantController');
const { protect, restrictTo, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Memory storage for Cloudinary upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', asyncHandler(listRestaurants));
router.get('/slug/:slug', asyncHandler(getRestaurantBySlug));
router.get('/id/:id', protect, asyncHandler(getRestaurantById));

// ─── Protected Routes (owner/manager only) ────────────────────────────────────
router.put('/:id', protect, restrictTo('owner', 'manager'), asyncHandler(updateRestaurant));
router.patch('/:id/go-live', protect, restrictTo('owner'), asyncHandler(toggleLive));
router.post('/:id/logo', protect, restrictTo('owner', 'manager'), upload.single('logo'), asyncHandler(uploadLogo));
router.post('/:id/cover', protect, restrictTo('owner', 'manager'), upload.single('cover'), asyncHandler(uploadCover));

module.exports = router;
