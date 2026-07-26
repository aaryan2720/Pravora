const Table = require('../models/Table');
const TableSession = require('../models/TableSession');
const Restaurant = require('../models/Restaurant');
const { successResponse } = require('../utils/helpers');

// ─── GET /api/tables — List all tables for the restaurant ─────────────────────
const getTables = async (req, res) => {
  const tables = await Table.find({ restaurantId: req.restaurantId, isActive: true })
    .sort('label')
    .lean();
  return successResponse(res, { tables, total: tables.length }, 'Tables retrieved');
};

// ─── POST /api/tables — Create a new table ───────────────────────────────────
const createTable = async (req, res) => {
  const { label, seats, branchId } = req.body;
  // qrToken is auto-generated via schema default (uuid)
  const table = await Table.create({
    restaurantId: req.restaurantId,
    branchId: branchId || null,
    label,
    seats,
  });

  const restaurant = await Restaurant.findById(req.restaurantId).select('settings').lean();
  const baseUrl = restaurant?.settings?.qrBaseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

  // Generate the QR URL that customers scan
  const qrUrl = `${baseUrl}/r/scan?token=${table.qrToken}`;
  return successResponse(res, { table, qrUrl }, 'Table created', 201);
};

// ─── PUT /api/tables/:id — Update label or seats ──────────────────────────────
const updateTable = async (req, res) => {
  const table = await Table.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });

  ['label', 'seats'].forEach((f) => { if (req.body[f] !== undefined) table[f] = req.body[f]; });
  await table.save();
  return successResponse(res, { table }, 'Table updated');
};

// ─── DELETE /api/tables/:id — Soft delete ────────────────────────────────────
const deleteTable = async (req, res) => {
  const table = await Table.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });
  if (table.status === 'occupied') {
    return res.status(400).json({ success: false, message: 'Cannot remove an occupied table.' });
  }
  table.isActive = false;
  await table.save();
  return successResponse(res, {}, 'Table removed');
};

// ─── POST /api/tables/:id/reset — Reset table to free ────────────────────────
const resetTable = async (req, res) => {
  const table = await Table.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });

  // Close any active session
  if (table.currentSessionId) {
    await TableSession.findByIdAndUpdate(table.currentSessionId, {
      status: 'closed',
      closedAt: new Date(),
    });
  }

  table.status = 'free';
  table.currentSessionId = null;
  table.reservationTime = null;
  table.guestName = null;
  await table.save();
  return successResponse(res, { table }, 'Table reset to free');
};

// ─── GET /api/tables/qr/:token — PUBLIC: resolve QR token → restaurant + table
const resolveQRToken = async (req, res) => {
  const table = await Table.findOne({ qrToken: req.params.token, isActive: true })
    .populate('restaurantId', 'slug name brandColor logo cuisine isLive hours')
    .lean();

  if (!table) {
    return res.status(404).json({ success: false, message: 'QR code not found or invalid.' });
  }

  if (!table.restaurantId.isLive) {
    return res.status(400).json({ success: false, message: 'This restaurant is currently offline.' });
  }

  return successResponse(res, {
    table: {
      id: table._id,
      label: table.label,
      seats: table.seats,
      status: table.status,
      qrToken: table.qrToken,
    },
    restaurant: table.restaurantId,
  }, 'QR resolved');
};

// ─── PATCH /api/tables/:id/status — Update status (staff) ────────────────────
const updateTableStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['free', 'occupied', 'reserved', 'paying', 'dirty'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }
  const table = await Table.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.restaurantId },
    { status },
    { new: true }
  );
  if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });
  return successResponse(res, { table }, 'Table status updated');
};

const regenerateAllTokens = async (req, res) => {
  const { v4: uuidv4 } = require('uuid');
  const tables = await Table.find({ restaurantId: req.restaurantId });
  for (const table of tables) {
    table.qrToken = uuidv4();
    await table.save();
  }
  return successResponse(res, { tables }, 'Regenerated secure tokens for all table QRs!');
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  resetTable,
  resolveQRToken,
  updateTableStatus,
  regenerateAllTokens,
};
