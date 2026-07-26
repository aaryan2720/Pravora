const Restaurant = require('../models/Restaurant');
const { makeSlug, successResponse } = require('../utils/helpers');
const cloudinary = require('../config/cloudinary');

// ─── GET /api/restaurants — Public discovery list ─────────────────────────────
const listRestaurants = async (req, res) => {
  const { city, type, live } = req.query;
  const filter = {};
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (type) filter.type = type;
  if (live === 'true') filter.isLive = true;

  const restaurants = await Restaurant.find(filter)
    .select('slug name tagline type cuisine brandColor logo coverImage location isLive avgRating totalReviews capacity rushLevel')
    .lean();

  return successResponse(res, { restaurants, total: restaurants.length }, 'Restaurants retrieved');
};

// ─── GET /api/restaurants/:slug — Public restaurant detail ────────────────────
const getRestaurantBySlug = async (req, res) => {
  const restaurant = await Restaurant.findOne({ slug: req.params.slug }).lean();
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found.' });
  }
  return successResponse(res, { restaurant }, 'Restaurant retrieved');
};

// ─── GET /api/restaurants/id/:id — By ID (staff) ─────────────────────────────
const getRestaurantById = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found.' });
  }
  return successResponse(res, { restaurant }, 'Restaurant retrieved');
};

// ─── PUT /api/restaurants/:id — Update settings (owner only) ─────────────────
const updateRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found.' });
  }

  // Tenant isolation — owner can only update their own restaurant
  if (restaurant.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  // Whitelist allowed update fields
  const allowed = [
    'name', 'tagline', 'description', 'type', 'serviceModel', 'cuisine',
    'brandColor', 'location', 'contact', 'hours', 'capacity', 'settings',
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) restaurant[field] = req.body[field];
  });

  // Re-slug if name changed
  if (req.body.name && req.body.name !== restaurant.name) {
    let newSlug = makeSlug(req.body.name);
    const existing = await Restaurant.findOne({ slug: newSlug, _id: { $ne: restaurant._id } });
    if (existing) newSlug = newSlug + '-' + Date.now();
    restaurant.slug = newSlug;
  }

  await restaurant.save();
  return successResponse(res, { restaurant }, 'Restaurant updated');
};

// ─── PATCH /api/restaurants/:id/go-live ──────────────────────────────────────
const toggleLive = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found.' });
  }
  if (restaurant.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  restaurant.isLive = !restaurant.isLive;
  await restaurant.save();

  return successResponse(
    res,
    { isLive: restaurant.isLive },
    `Restaurant is now ${restaurant.isLive ? 'live' : 'offline'}`
  );
};

// ─── POST /api/restaurants/:id/logo ──────────────────────────────────────────
const uploadLogo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `serveloop/${restaurant._id}/brand`, public_id: 'logo', overwrite: true },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    restaurant.logo = result.secure_url;
    await restaurant.save();
    return successResponse(res, { logo: result.secure_url }, 'Logo uploaded');
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Image upload failed.', error: err.message });
  }
};

// ─── POST /api/restaurants/:id/cover ─────────────────────────────────────────
const uploadCover = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `serveloop/${restaurant._id}/brand`, public_id: 'cover', overwrite: true },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    restaurant.coverImage = result.secure_url;
    await restaurant.save();
    return successResponse(res, { coverImage: result.secure_url }, 'Cover uploaded');
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Image upload failed.', error: err.message });
  }
};

module.exports = {
  listRestaurants,
  getRestaurantBySlug,
  getRestaurantById,
  updateRestaurant,
  toggleLive,
  uploadLogo,
  uploadCover,
};
