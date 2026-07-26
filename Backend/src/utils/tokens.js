const jwt = require('jsonwebtoken');

/**
 * Generate an access token (short-lived: 15m default)
 */
const generateAccessToken = (id, type = 'staff') => {
  return jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate a refresh token (long-lived: 7d default)
 */
const generateRefreshToken = (id, type = 'staff') => {
  return jwt.sign(
    { id, type },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate both tokens and return as an object
 */
const generateTokenPair = (id, type = 'staff') => {
  return {
    accessToken: generateAccessToken(id, type),
    refreshToken: generateRefreshToken(id, type),
  };
};

/**
 * Verify a refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyRefreshToken,
};
