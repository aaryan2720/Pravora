const TableSession = require('../models/TableSession');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const { successResponse } = require('../utils/helpers');

// ─── POST /api/sessions — Create session from QR scan ────────────────────────
const createSession = async (req, res) => {
  const { tableId, restaurantId, guestCount, guestId } = req.body;

  // Validate table belongs to restaurant and is available
  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });

  if (table.status === 'occupied') {
    // Return the existing active session
    const existing = await TableSession.findOne({ tableId, status: 'active' });
    if (existing) {
      // Auto-associate guestId if they signed in/registered after starting
      if (guestId && !existing.guestId) {
        existing.guestId = guestId;
        await existing.save();
      }
      return successResponse(res, { session: existing, isExisting: true }, 'Resumed existing session');
    }
  }

  // Create new session
  const session = await TableSession.create({
    restaurantId,
    tableId,
    tableLabel: table.label,
    guestCount: guestCount || 1,
    guestId: guestId || null,
  });

  // Update table status
  table.status = 'occupied';
  table.currentSessionId = session._id;
  await table.save();

  return successResponse(res, { session }, 'Session started', 201);
};

// ─── GET /api/sessions/:id — Get session with orders + bill ──────────────────
const getSession = async (req, res) => {
  const session = await TableSession.findById(req.params.id)
    .populate('tableId', 'label seats status')
    .lean();
  if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

  // Get all orders for this session
  const orders = await Order.find({ sessionId: session._id }).sort('placedAt').lean();

  // Get bill if it exists
  const bill = await Bill.findOne({ sessionId: session._id }).lean();

  return successResponse(res, { session, orders, bill }, 'Session retrieved');
};

// ─── GET /api/sessions/active — Get all active sessions (staff) ──────────────
const getActiveSessions = async (req, res) => {
  const sessions = await TableSession.find({
    restaurantId: req.restaurantId,
    status: { $in: ['active', 'billing'] },
  })
    .populate('tableId', 'label seats')
    .sort('startedAt')
    .lean();

  // Attach order counts
  const enriched = await Promise.all(
    sessions.map(async (s) => {
      const orderCount = await Order.countDocuments({ sessionId: s._id });
      return { ...s, orderCount };
    })
  );

  return successResponse(res, { sessions: enriched, total: enriched.length }, 'Active sessions retrieved');
};

// ─── PATCH /api/sessions/:id/close — Close session ──────────────────────────
const closeSession = async (req, res) => {
  const session = await TableSession.findById(req.params.id);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

  session.status = 'closed';
  session.closedAt = new Date();
  await session.save();

  // Free the table
  await Table.findByIdAndUpdate(session.tableId, {
    status: 'free',
    currentSessionId: null,
    guestName: null,
    reservationTime: null,
  });

  return successResponse(res, { session }, 'Session closed');
};

module.exports = { createSession, getSession, getActiveSessions, closeSession };
