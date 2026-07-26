const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Guest = require('../models/Guest');

/**
 * protect — verifies JWT from Authorization: Bearer header.
 * Attaches req.user (staff) or req.guest (customer/diner) to the request.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please refresh.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Determine if this is a staff user or a guest/customer
    if (decoded.type === 'guest') {
      const guest = await Guest.findById(decoded.id);
      if (!guest) {
        return res.status(401).json({ success: false, message: 'Guest account not found.' });
      }
      req.guest = guest;
      req.userType = 'guest';
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account not found.' });
      }
      req.user = user;
      req.userType = 'staff';
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * restrictTo — role-based access control for staff routes.
 * Usage: restrictTo('owner', 'manager')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'This action is restricted to staff accounts.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of: ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

/**
 * tenantGuard — ensures the authenticated user's restaurantId
 * matches the restaurantId in the route parameter or request body.
 *
 * Attach to any route that works on tenant-scoped resources.
 * The route must set req.params.restaurantId or use req.user.restaurantId.
 */
const tenantGuard = (req, res, next) => {
  if (!req.user) return next(); // guests don't need tenant isolation this way

  const userRestaurantId = req.user.restaurantId?.toString();

  // Allow owners/managers to access their own restaurant
  if (!userRestaurantId) {
    return res.status(403).json({ success: false, message: 'User is not associated with any restaurant.' });
  }

  // If a restaurantId is in params, validate it matches
  if (req.params.restaurantId && req.params.restaurantId !== userRestaurantId) {
    return res.status(403).json({ success: false, message: 'Access denied. Tenant mismatch.' });
  }

  // Automatically inject restaurantId into query/body so controllers don't have to repeat it
  req.restaurantId = userRestaurantId;
  next();
};

/**
 * optionalAuth — try to authenticate but don't block if no token.
 * Used on public routes that benefit from knowing who the user is (e.g. menu with favourites).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'guest') {
      req.guest = await Guest.findById(decoded.id);
    } else {
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch {
    // Token invalid — just proceed without auth
    next();
  }
};

module.exports = { protect, restrictTo, tenantGuard, optionalAuth };
