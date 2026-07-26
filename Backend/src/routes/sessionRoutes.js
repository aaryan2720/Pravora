const express = require('express');
const router = express.Router();
const { createSession, getSession, getActiveSessions, closeSession } = require('../controllers/sessionController');
const { protect, tenantGuard, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Create session: optionalAuth (guest can create without being logged in)
router.post('/', optionalAuth, asyncHandler(createSession));

// Get session by ID: optionalAuth (customer can view their own session)
router.get('/:id', optionalAuth, asyncHandler(getSession));

// Staff only: active sessions list + close
router.get('/', protect, tenantGuard, asyncHandler(getActiveSessions));
router.patch('/:id/close', protect, tenantGuard, asyncHandler(closeSession));

module.exports = router;
