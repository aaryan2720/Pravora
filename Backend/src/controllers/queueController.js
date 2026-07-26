const QueueEntry = require('../models/QueueEntry');
const Table = require('../models/Table');
const { successResponse, generateQueueToken } = require('../utils/helpers');

// ─── GET /api/queue — Current queue list ──────────────────────────────────────
const getQueue = async (req, res) => {
  const restaurantId = req.restaurantId || req.query.restaurantId;
  const entries = await QueueEntry.find({ restaurantId, status: 'waiting' })
    .sort('joinedAt')
    .lean();
  return successResponse(res, { entries, total: entries.length }, 'Queue retrieved');
};

// ─── POST /api/queue — Add guest to queue ────────────────────────────────────
const joinQueue = async (req, res) => {
  const { guestName, guestPhone, partySize, restaurantId: bodyRestaurantId } = req.body;
  const restaurantId = req.restaurantId || bodyRestaurantId;
  if (!restaurantId) return res.status(400).json({ success: false, message: 'restaurantId is required.' });

  // Count today's entries to generate next token
  const todayCount = await QueueEntry.countDocuments({ restaurantId });
  const token = generateQueueToken(todayCount + 1);

  // Rough estimated wait: 5 min per party ahead
  const waitingCount = await QueueEntry.countDocuments({ restaurantId, status: 'waiting' });
  const estimatedWait = Math.max(5, waitingCount * 5);

  const entry = await QueueEntry.create({
    restaurantId,
    guestName,
    guestPhone: guestPhone || null,
    partySize,
    token,
    estimatedWait,
  });

  return successResponse(res, { entry }, 'Added to queue', 201);
};

// ─── PATCH /api/queue/:id/seat — Mark as seated ──────────────────────────────
const seatGuest = async (req, res) => {
  const { tableId } = req.body;
  const entry = await QueueEntry.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.restaurantId },
    { status: 'seated', seatedAt: new Date(), tableId: tableId || null },
    { new: true }
  );
  if (!entry) return res.status(404).json({ success: false, message: 'Queue entry not found.' });

  if (tableId) {
    await Table.findByIdAndUpdate(tableId, { status: 'occupied', guestName: entry.guestName });
  }

  return successResponse(res, { entry }, 'Guest seated');
};

// ─── PATCH /api/queue/:id/leave — Mark as left ───────────────────────────────
const guestLeft = async (req, res) => {
  const entry = await QueueEntry.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.restaurantId },
    { status: 'left' },
    { new: true }
  );
  if (!entry) return res.status(404).json({ success: false, message: 'Queue entry not found.' });
  return successResponse(res, { entry }, 'Guest marked as left');
};

module.exports = { getQueue, joinQueue, seatGuest, guestLeft };
