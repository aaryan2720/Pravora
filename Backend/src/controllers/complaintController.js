const Complaint = require('../models/Complaint');
const { successResponse } = require('../utils/helpers');

// ─── POST /api/complaints — Create customer/diner complaint ─────────────────
const createComplaint = async (req, res) => {
  const { restaurantId, tableId, sessionId, guestName, guestPhone, category, description } = req.body;

  if (!restaurantId || !guestName || !description) {
    return res.status(400).json({
      success: false,
      message: 'restaurantId, guestName, and description are required.',
    });
  }

  const complaint = await Complaint.create({
    restaurantId,
    tableId: tableId || null,
    sessionId: sessionId || null,
    guestName,
    guestPhone: guestPhone || null,
    category: category || 'other',
    description,
    status: 'pending',
  });

  return successResponse(res, { complaint }, 'Complaint reported successfully', 201);
};

// ─── GET /api/complaints — Get all complaints for the restaurant tenant ────────
const getComplaints = async (req, res) => {
  const { status, category } = req.query;
  const filter = { restaurantId: req.restaurantId };

  if (status) filter.status = status;
  if (category) filter.category = category;

  const complaints = await Complaint.find(filter)
    .populate('tableId', 'label')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return successResponse(res, { complaints }, 'Complaints retrieved successfully');
};

// ─── PATCH /api/complaints/:id — Update complaint assignment or status ─────────
const updateComplaintStatus = async (req, res) => {
  const { status, assignedTo, notes } = req.body;
  const validStatuses = ['pending', 'in_progress', 'resolved'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const complaint = await Complaint.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  if (status) complaint.status = status;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
  if (notes !== undefined) complaint.notes = notes;

  await complaint.save();

  const updatedComplaint = await Complaint.findById(complaint._id)
    .populate('tableId', 'label')
    .populate('assignedTo', 'name email role')
    .lean();

  return successResponse(res, { complaint: updatedComplaint }, 'Complaint updated successfully');
};

// ─── DELETE /api/complaints/:id — Delete/remove complaint ──────────────────────
const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findOneAndDelete({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }
  return successResponse(res, {}, 'Complaint deleted successfully');
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  deleteComplaint,
};
