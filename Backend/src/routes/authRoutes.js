const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
  getMe,
  customerRegister,
  customerLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { asyncHandler, validate } = require('../middleware/errorHandler');

// ─── Staff / Restaurant Owner Auth ────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('restaurantName').optional().trim(),
  ],
  validate,
  asyncHandler(register)
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(login)
);

router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.get('/me', protect, asyncHandler(getMe));

// ─── Customer / Diner Auth ────────────────────────────────────────────────────
router.post(
  '/customer/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
  ],
  validate,
  asyncHandler(customerRegister)
);

router.post(
  '/customer/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(customerLogin)
);

module.exports = router;
