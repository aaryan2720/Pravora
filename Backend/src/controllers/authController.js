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

// ─── POST /api/auth/google ────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Google ID Token is required.' });
  }

  const { OAuth2Client } = require('google-auth-library');
  const slugify = require('slugify');
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return res.status(500).json({ success: false, message: 'Google Client ID is not configured on the backend.' });
  }

  const client = new OAuth2Client(googleClientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || null,
        role: 'owner',
        isVerified: true
      });

      // Create restaurant stub
      const baseSlug = slugify(name, { lower: true, strict: true }) || 'restaurant';
      let slug = `${baseSlug}-restaurant`;
      
      const slugExists = await Restaurant.findOne({ slug });
      if (slugExists) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const restaurant = await Restaurant.create({
        name: `${name}'s Restaurant`,
        slug,
        owner: user._id,
      });

      user.restaurantId = restaurant._id;
      await user.save();
      console.log(`🏢 Created Restaurant stub for Google OAuth user "${email}": ${restaurant.name} (${slug})`);
    } else {
      // Link Google ID if not already linked
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
      console.log(`🔗 Logged in existing user "${email}" via Google OAuth`);
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id, 'staff');
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(
      res, 
      { user, accessToken, refreshToken, isNewUser }, 
      'Logged in with Google successfully'
    );
  } catch (err) {
    console.error('❌ Google verification error:', err);
    return res.status(400).json({ success: false, message: 'Invalid Google ID Token.' });
  }
};

// ─── POST /api/auth/customer/google ───────────────────────────────────────────
const customerGoogleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Google ID Token is required.' });
  }

  const { OAuth2Client } = require('google-auth-library');
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return res.status(500).json({ success: false, message: 'Google Client ID is not configured on the backend.' });
  }

  const client = new OAuth2Client(googleClientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let guest = await Guest.findOne({ email });
    let isNewGuest = false;

    if (!guest) {
      isNewGuest = true;
      guest = await Guest.create({
        name,
        email,
        googleId,
        avatar: picture || null,
        isVerified: true
      });
      console.log(`🍽️ Created Diner/Guest account for Google OAuth user "${email}": ${name}`);
    } else {
      let updated = false;
      if (!guest.googleId) {
        guest.googleId = googleId;
        updated = true;
      }
      if (picture && !guest.avatar) {
        guest.avatar = picture;
        updated = true;
      }
      if (updated) {
        await guest.save();
      }
      console.log(`🔗 Logged in existing Diner/Guest "${email}" via Google OAuth`);
    }

    const { accessToken, refreshToken } = generateTokenPair(guest._id, 'guest');
    guest.refreshToken = refreshToken;
    await guest.save({ validateBeforeSave: false });

    return successResponse(
      res, 
      { guest, accessToken, refreshToken, isNewGuest }, 
      'Logged in with Google successfully'
    );
  } catch (err) {
    console.error('❌ Google verification error for diner:', err);
    return res.status(400).json({ success: false, message: 'Invalid Google ID Token.' });
  }
};

// ─── PATCH /api/auth/customer/profile ──────────────────────────────────────────
const updateCustomerProfile = async (req, res) => {
  const guestId = req.guest?._id;
  if (!guestId) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Only diner accounts can update this profile.' });
  }

  const { name, phone, dietaryPreference, allergies } = req.body;

  try {
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Diner account not found.' });
    }

    if (name !== undefined) guest.name = name;
    if (phone !== undefined) guest.phone = phone;
    if (dietaryPreference !== undefined) guest.dietaryPreference = dietaryPreference;
    if (allergies !== undefined) guest.allergies = allergies;

    await guest.save();

    return successResponse(res, { guest }, 'Profile updated successfully');
  } catch (err) {
    console.error('❌ Failed to update customer profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  customerRegister,
  customerLogin,
  googleLogin,
  customerGoogleLogin,
  updateCustomerProfile,
};
