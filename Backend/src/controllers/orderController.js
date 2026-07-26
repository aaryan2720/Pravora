const Order = require('../models/Order');
const TableSession = require('../models/TableSession');
const MenuItem = require('../models/MenuItem');
const { successResponse, paginate } = require('../utils/helpers');

// ─── GET /api/orders — List orders (staff, filterable) ───────────────────────
const getOrders = async (req, res) => {
  const { status, tableId, sessionId } = req.query;
  const { limit, skip } = paginate(req.query);

  const filter = { restaurantId: req.restaurantId };
  if (status) filter.status = status;
  if (tableId) filter.tableId = tableId;
  if (sessionId) filter.sessionId = sessionId;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-placedAt').limit(limit).skip(skip).lean(),
    Order.countDocuments(filter),
  ]);

  return successResponse(res, { orders, total }, 'Orders retrieved');
};

// ─── POST /api/orders — Place a new order ────────────────────────────────────
const placeOrder = async (req, res) => {
  const { sessionId, tableId, tableLabel, items, guestNote, restaurantId } = req.body;

  // Validate session exists and is active
  const session = await TableSession.findById(sessionId);
  if (!session || session.status !== 'active') {
    return res.status(400).json({ success: false, message: 'No active session found for this table.' });
  }

  // Validate and enrich items (pull live price and name from DB)
  const enrichedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.itemId).lean();
    if (!menuItem || !menuItem.isActive) {
      return res.status(400).json({ success: false, message: `Item "${item.itemId}" is not available.` });
    }
    if (menuItem.availability === 'unavailable') {
      return res.status(400).json({ success: false, message: `"${menuItem.name}" is currently unavailable.` });
    }
    const lineTotal = menuItem.price * item.qty;
    subtotal += lineTotal;
    enrichedItems.push({
      itemId: menuItem._id,
      name: menuItem.name,
      qty: item.qty,
      price: menuItem.price, // Capture price at time of order
      note: item.note || '',
    });
  }

  const order = await Order.create({
    restaurantId: restaurantId || session.restaurantId,
    sessionId,
    tableId: tableId || session.tableId,
    tableLabel: tableLabel || session.tableLabel,
    items: enrichedItems,
    subtotal,
    guestNote: guestNote || '',
  });

  // Auto-associate guestId if they placed an order while authenticated
  if (req.guest?._id && !session.guestId) {
    session.guestId = req.guest._id;
  }

  // Update session totals
  session.totalOrders += 1;
  session.subtotal += subtotal;
  await session.save();

  return successResponse(res, { order }, 'Order placed', 201);
};

// ─── GET /api/orders/:id — Single order detail ───────────────────────────────
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  return successResponse(res, { order }, 'Order retrieved');
};

// ─── PATCH /api/orders/:id/status — Update order status (staff/kitchen) ──────
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.restaurantId },
    { status, updatedBy: req.user._id },
    { new: true }
  );
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  return successResponse(res, { order }, 'Order status updated');
};

// ─── DELETE /api/orders/:id — Cancel pending order ───────────────────────────
const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled.' });
  }

  order.status = 'cancelled';
  order.updatedBy = req.user._id;
  await order.save();

  // Deduct from session subtotal
  await TableSession.findByIdAndUpdate(order.sessionId, {
    $inc: { subtotal: -order.subtotal, totalOrders: -1 },
  });

  return successResponse(res, {}, 'Order cancelled');
};

module.exports = { getOrders, placeOrder, getOrder, updateOrderStatus, cancelOrder };
