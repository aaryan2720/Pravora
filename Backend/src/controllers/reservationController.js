const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { sendReservationConfirmation } = require('../services/emailService');
const { successResponse, paginate, getTodayDateString } = require('../utils/helpers');

// ─── GET /api/reservations ────────────────────────────────────────────────────
const getReservations = async (req, res) => {
  const { date, status } = req.query;
  const { limit, skip } = paginate(req.query);
  const filter = { restaurantId: req.restaurantId };
  if (date) filter.date = date;
  else filter.date = { $gte: getTodayDateString() }; // Return today's and all future reservations by default
  if (status) filter.status = status;

  const [reservations, total] = await Promise.all([
    Reservation.find(filter).sort('time').limit(limit).skip(skip).lean(),
    Reservation.countDocuments(filter),
  ]);
  return successResponse(res, { reservations, total }, 'Reservations retrieved');
};

// ─── POST /api/reservations — Create reservation ─────────────────────────────
const createReservation = async (req, res) => {
  const { guestName, guestPhone, guestEmail, partySize, date, time, notes } = req.body;

  // Determine restaurantId — either from auth or body (public endpoint)
  const restaurantId = req.restaurantId || req.body.restaurantId;
  if (!restaurantId) return res.status(400).json({ success: false, message: 'restaurantId is required.' });

  const reservation = await Reservation.create({
    restaurantId,
    guestName,
    guestPhone,
    guestEmail: guestEmail || null,
    guestId: req.guest?._id || null,
    partySize,
    date,
    time,
    notes: notes || '',
  });

  // Send confirmation email if email provided (non-blocking)
  if (guestEmail) {
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(restaurantId).select('name').lean();
    sendReservationConfirmation({
      guestEmail,
      guestName,
      restaurantName: restaurant?.name || 'Pravora Restaurant',
      date,
      time,
      partySize,
    }).catch(() => {});
  }

  return successResponse(res, { reservation }, 'Reservation created', 201);
};

// ─── GET /api/reservations/:id ────────────────────────────────────────────────
const getReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).lean();
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });
  return successResponse(res, { reservation }, 'Reservation retrieved');
};

// ─── PATCH /api/reservations/:id/status ──────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  const { status, tableId, staffNotes } = req.body;
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'seated', 'no_show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const reservation = await Reservation.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

  reservation.status = status;
  if (staffNotes) reservation.staffNotes = staffNotes;
  if (tableId) reservation.tableId = tableId;
  if (status === 'confirmed') {
    reservation.confirmedBy = req.user._id;
    reservation.confirmedAt = new Date();
    // Mark table as reserved
    if (tableId) await Table.findByIdAndUpdate(tableId, { status: 'reserved', guestName: reservation.guestName, reservationTime: reservation.time });
  }

  await reservation.save();
  return successResponse(res, { reservation }, 'Reservation updated');
};

// ─── DELETE /api/reservations/:id ────────────────────────────────────────────
const cancelReservation = async (req, res) => {
  const reservation = await Reservation.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.restaurantId },
    { status: 'cancelled' },
    { new: true }
  );
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

  // Free the table if one was assigned
  if (reservation.tableId) {
    await Table.findByIdAndUpdate(reservation.tableId, { status: 'free', guestName: null, reservationTime: null });
  }

  return successResponse(res, {}, 'Reservation cancelled');
};

module.exports = { getReservations, createReservation, getReservation, updateReservationStatus, cancelReservation };
