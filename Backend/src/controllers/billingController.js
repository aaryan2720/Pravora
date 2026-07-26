const Bill = require('../models/Bill');
const Order = require('../models/Order');
const TableSession = require('../models/TableSession');
const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const Membership = require('../models/Membership');
const { calcBillAmounts, successResponse } = require('../utils/helpers');
const { sendBillReadyEmail } = require('../services/emailService');

// ─── POST /api/billing/generate — Generate bill for a session ────────────────
const generateBill = async (req, res) => {
  const { sessionId } = req.body;

  // Check if bill already exists
  const existing = await Bill.findOne({ sessionId });
  if (existing) return successResponse(res, { bill: existing }, 'Bill already generated');

  const session = await TableSession.findById(sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

  // Gather all non-cancelled orders for this session
  const orders = await Order.find({ sessionId, status: { $ne: 'cancelled' } }).lean();
  if (!orders.length) {
    return res.status(400).json({ success: false, message: 'No orders found for this session.' });
  }

  // Compute subtotal from orders
  const subtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);

  // Get restaurant tax/service charge settings
  const restaurant = await Restaurant.findById(session.restaurantId).select('settings name').lean();
  const taxRate = restaurant?.settings?.taxRate ?? 10;
  const serviceChargeRate = restaurant?.settings?.serviceChargeRate ?? 5;

  const { taxAmount, serviceChargeAmount, total } = calcBillAmounts(subtotal, taxRate, serviceChargeRate);

  // Build order snapshots for the receipt
  const orderSnapshots = orders.map((o) => ({
    orderId: o._id,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, total: i.price * i.qty })),
    subtotal: o.subtotal,
  }));

  const bill = await Bill.create({
    restaurantId: session.restaurantId,
    sessionId,
    tableId: session.tableId,
    tableLabel: session.tableLabel,
    orderSnapshots,
    subtotal,
    taxRate,
    taxAmount,
    serviceChargeRate,
    serviceChargeAmount,
    total,
    guestId: session.guestId || null,
  });

  // Update session to billing state
  session.status = 'billing';
  await session.save();
  await Table.findByIdAndUpdate(session.tableId, { status: 'paying' });

  // Email the guest if they are a registered member with email
  if (session.guestId) {
    const Guest = require('../models/Guest');
    const guest = await Guest.findById(session.guestId).select('email name').lean();
    if (guest?.email) {
      sendBillReadyEmail({ guestEmail: guest.email, guestName: guest.name, restaurantName: restaurant?.name, total }).catch(() => {});
    }
  }

  return successResponse(res, { bill }, 'Bill generated', 201);
};

// ─── GET /api/billing/:sessionId — Get bill for session ──────────────────────
const getBill = async (req, res) => {
  const bill = await Bill.findOne({ sessionId: req.params.sessionId }).lean();
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
  return successResponse(res, { bill }, 'Bill retrieved');
};

// ─── PATCH /api/billing/:billId/pay — Mark bill paid + close session ──────────
const markPaid = async (req, res) => {
  const { paymentMethod } = req.body;

  const bill = await Bill.findById(req.params.billId);
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
  if (bill.status === 'paid') return successResponse(res, { bill }, 'Bill already paid');

  bill.status = 'paid';
  bill.paymentMethod = paymentMethod || 'cash';
  bill.paidAt = new Date();
  bill.paidBy = req.user?._id || null;
  await bill.save();

  // Close the session
  await TableSession.findByIdAndUpdate(bill.sessionId, { status: 'closed', closedAt: new Date() });
  await Table.findByIdAndUpdate(bill.tableId, { status: 'dirty', currentSessionId: null });

  // Update membership points (1 point per ₹10 spent)
  if (bill.guestId) {
    const pointsEarned = Math.floor(bill.total / 10);
    await Membership.findOneAndUpdate(
      { guestId: bill.guestId, restaurantId: bill.restaurantId },
      {
        $inc: { points: pointsEarned, visits: 1, totalSpent: bill.total },
        lastVisitAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Dynamic receipt email dispatching
    try {
      const Guest = require('../models/Guest');
      const guest = await Guest.findById(bill.guestId).select('name email').lean();
      if (guest?.email) {
        const { sendReceiptEmail } = require('../services/emailService');
        sendReceiptEmail({ guestEmail: guest.email, guestName: guest.name, bill }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to trigger receipt email:', err);
    }
  }

  return successResponse(res, { bill }, 'Payment confirmed. Session closed.');
};

module.exports = { generateBill, getBill, markPaid };
