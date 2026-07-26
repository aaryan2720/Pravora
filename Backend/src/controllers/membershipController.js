const Membership = require('../models/Membership');
const Guest = require('../models/Guest');
const Bill = require('../models/Bill');
const { successResponse, paginate } = require('../utils/helpers');

// ─── GET /api/memberships/customers — List guest customers for a restaurant ──
const getCustomers = async (req, res) => {
  const { limit, skip } = paginate(req.query);
  const memberships = await Membership.find({ restaurantId: req.restaurantId })
    .sort('-totalSpent')
    .limit(limit)
    .skip(skip)
    .populate('guestId', 'name email phone avatar lastVisitAt')
    .lean();

  const total = await Membership.countDocuments({ restaurantId: req.restaurantId });
  return successResponse(res, { customers: memberships, total }, 'Customers retrieved');
};

// ─── GET /api/memberships/customers/:id — Guest profile + visit history ───────
const getCustomerProfile = async (req, res) => {
  const membership = await Membership.findOne({
    guestId: req.params.id,
    restaurantId: req.restaurantId,
  })
    .populate('guestId', 'name email phone avatar createdAt')
    .populate('favorites', 'name price categoryId image')
    .lean();

  if (!membership) return res.status(404).json({ success: false, message: 'Customer not found.' });

  // Last 5 bills for visit history
  const bills = await Bill.find({ guestId: req.params.id, restaurantId: req.restaurantId })
    .sort('-createdAt')
    .limit(5)
    .select('total createdAt paymentMethod tableLabel')
    .lean();

  return successResponse(res, { membership, recentBills: bills }, 'Customer profile retrieved');
};

// ─── POST /api/memberships/favorites — Toggle a favorite item ─────────────────
const toggleFavorite = async (req, res) => {
  const { itemId, restaurantId } = req.body;
  const guestId = req.guest._id;

  let membership = await Membership.findOne({ guestId, restaurantId });
  if (!membership) {
    membership = await Membership.create({ guestId, restaurantId });
  }

  const idx = membership.favorites.indexOf(itemId);
  if (idx > -1) {
    membership.favorites.splice(idx, 1); // remove
  } else {
    membership.favorites.push(itemId); // add
  }

  await membership.save();
  return successResponse(res, { favorites: membership.favorites }, 'Favorites updated');
};

const getMyMemberships = async (req, res) => {
  const guestId = req.guest?._id || req.user?._id;
  if (!guestId) {
    return res.status(401).json({ success: false, message: 'Customer account not found.' });
  }

  // Find all memberships for this guest, populating the restaurant branding details
  const memberships = await Membership.find({ guestId })
    .populate('restaurantId', 'name slug logo brandColor coverImage type')
    .lean();

  // Find recent bills for this guest across any restaurant
  const bills = await Bill.find({ guestId })
    .sort('-createdAt')
    .limit(10)
    .populate('restaurantId', 'name slug logo brandColor')
    .lean();

  return successResponse(res, { memberships, recentBills: bills }, 'Guest memberships retrieved');
};

module.exports = { getCustomers, getCustomerProfile, toggleFavorite, getMyMemberships };
