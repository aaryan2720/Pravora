const User = require('../models/User');
const Guest = require('../models/Guest');
const Restaurant = require('../models/Restaurant');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/tokens');
const { makeSlug, successResponse } = require('../utils/helpers');
const { sendWelcomeEmail } = require('../services/emailService');

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, restaurantName } = req.body;

  // Check existing user
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: 'owner',
  });

  // Create restaurant stub
  let slug = makeSlug(restaurantName || name + '-restaurant');
  // Ensure slug uniqueness
  let slugExists = await Restaurant.findOne({ slug });
  if (slugExists) slug = slug + '-' + Date.now();

  const restaurant = await Restaurant.create({
    name: restaurantName || `${name}'s Restaurant`,
    slug,
    owner: user._id,
  });

  // Link user to restaurant
  user.restaurantId = restaurant._id;
  const { accessToken, refreshToken } = generateTokenPair(user._id, 'staff');
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(() => {});

  return successResponse(
    res,
    { user, restaurant, accessToken, refreshToken },
    'Account created successfully',
    201
  );
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const { accessToken, refreshToken } = generateTokenPair(user._id, 'staff');
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return successResponse(res, { user, accessToken, refreshToken }, 'Logged in successfully');
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required.' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  const Model = decoded.type === 'guest' ? Guest : User;
  const account = await Model.findById(decoded.id).select('+refreshToken');

  if (!account || account.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token is invalid or has been revoked.' });
  }

  const newAccessToken = generateAccessToken(account._id, decoded.type);
  return successResponse(res, { accessToken: newAccessToken }, 'Token refreshed');
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    // Invalidate the stored refresh token
    const user = await User.findOne({ refreshToken }).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
    const guest = await Guest.findOne({ refreshToken }).select('+refreshToken');
    if (guest) {
      guest.refreshToken = null;
      await guest.save({ validateBeforeSave: false });
    }
  }
  return successResponse(res, {}, 'Logged out successfully');
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  const account = req.user || req.guest;
  if (!account) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  let data = { account, userType: req.userType };

  // For staff, also return restaurant info
  if (req.user && req.user.restaurantId) {
    data.restaurant = await Restaurant.findById(req.user.restaurantId);
  }

  return successResponse(res, data, 'Profile retrieved');
};

// ─── POST /api/auth/customer/register ────────────────────────────────────────
const customerRegister = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const exists = await Guest.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const guest = await Guest.create({ name, email, passwordHash: password, phone });
  const { accessToken, refreshToken } = generateTokenPair(guest._id, 'guest');
  guest.refreshToken = refreshToken;
  await guest.save({ validateBeforeSave: false });

  // Send welcome email (non-blocking)
  const { sendGuestWelcomeEmail } = require('../services/emailService');
  sendGuestWelcomeEmail(guest).catch(() => {});

  return successResponse(res, { guest, accessToken, refreshToken }, 'Customer account created', 201);
};

// ─── POST /api/auth/customer/login ───────────────────────────────────────────
const customerLogin = async (req, res) => {
  const { email, password } = req.body;

  const guest = await Guest.findOne({ email }).select('+passwordHash');
  if (!guest || !(await guest.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const { accessToken, refreshToken } = generateTokenPair(guest._id, 'guest');
  guest.refreshToken = refreshToken;
  await guest.save({ validateBeforeSave: false });

  return successResponse(res, { guest, accessToken, refreshToken }, 'Logged in successfully');
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  customerRegister,
  customerLogin,
};
