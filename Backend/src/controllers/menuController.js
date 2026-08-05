const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const MenuPriceHistory = require('../models/MenuPriceHistory');
const cloudinary = require('../config/cloudinary');
const { successResponse } = require('../utils/helpers');

// ─── Categories ───────────────────────────────────────────────────────────────

const getCategories = async (req, res) => {
  const restaurantId = req.restaurantId || req.query.restaurantId;
  const categories = await MenuCategory.find({ restaurantId, isActive: true })
    .sort('sortOrder')
    .populate('itemCount')
    .lean();
  return successResponse(res, { categories }, 'Categories retrieved');
};

const createCategory = async (req, res) => {
  const { name, icon, description, sortOrder, isSpecial } = req.body;
  const category = await MenuCategory.create({
    restaurantId: req.restaurantId,
    name, icon, description, sortOrder, isSpecial,
  });
  return successResponse(res, { category }, 'Category created', 201);
};

const updateCategory = async (req, res) => {
  const category = await MenuCategory.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

  ['name', 'icon', 'description', 'sortOrder', 'isSpecial', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();
  return successResponse(res, { category }, 'Category updated');
};

const deleteCategory = async (req, res) => {
  const category = await MenuCategory.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  category.isActive = false;
  await category.save();
  return successResponse(res, {}, 'Category removed');
};

// ─── Items ────────────────────────────────────────────────────────────────────

// Public: full menu for a restaurant (customer facing)
const getPublicMenu = async (req, res) => {
  const { restaurantId } = req.params;
  const categories = await MenuCategory.find({ restaurantId, isActive: true }).sort('sortOrder').lean();
  const items = await MenuItem.find({ restaurantId, isActive: true }).sort('sortOrder categoryId').lean();

  // Group items under categories
  const menu = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.categoryId.toString() === cat._id.toString()),
  }));

  return successResponse(res, { menu }, 'Menu retrieved');
};

const getItems = async (req, res) => {
  const { categoryId, availability } = req.query;
  const filter = { restaurantId: req.restaurantId, isActive: true };
  if (categoryId) filter.categoryId = categoryId;
  if (availability) filter.availability = availability;

  const items = await MenuItem.find(filter).sort('sortOrder').lean();
  return successResponse(res, { items, total: items.length }, 'Items retrieved');
};

const createItem = async (req, res) => {
  const item = await MenuItem.create({ ...req.body, restaurantId: req.restaurantId });
  return successResponse(res, { item }, 'Item created', 201);
};

const updateItem = async (req, res) => {
  const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  // If price changed — record history
  if (req.body.price !== undefined && req.body.price !== item.price) {
    await MenuPriceHistory.create({
      restaurantId: req.restaurantId,
      itemId: item._id,
      itemName: item.name,
      oldPrice: item.price,
      newPrice: req.body.price,
      changedBy: req.user._id,
      reason: req.body.priceChangeReason || '',
    });
  }

  const allowed = ['name', 'description', 'price', 'originalPrice', 'isVeg', 'isSpecial',
    'availability', 'prepTime', 'tags', 'allergens', 'spiceLevel', 'sortOrder', 'categoryId', 'isActive'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) item[f] = req.body[f]; });

  await item.save();
  return successResponse(res, { item }, 'Item updated');
};

const updateAvailability = async (req, res) => {
  const { availability } = req.body;
  if (!['available', 'unavailable', 'soon'].includes(availability)) {
    return res.status(400).json({ success: false, message: 'Invalid availability value.' });
  }
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.restaurantId },
    { availability },
    { new: true }
  );
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  return successResponse(res, { item }, 'Availability updated');
};

const updatePrice = async (req, res) => {
  const { price, reason } = req.body;
  if (!price || price <= 0) return res.status(400).json({ success: false, message: 'Valid price is required.' });

  const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  await MenuPriceHistory.create({
    restaurantId: req.restaurantId,
    itemId: item._id,
    itemName: item.name,
    oldPrice: item.price,
    newPrice: price,
    changedBy: req.user._id,
    reason: reason || '',
  });

  item.price = price;
  await item.save();
  return successResponse(res, { item }, 'Price updated');
};

const deleteItem = async (req, res) => {
  const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  item.isActive = false;
  await item.save();
  return successResponse(res, {}, 'Item removed');
};

// ─── Image Upload for Menu Item ───────────────────────────────────────────────
const uploadItemImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  // Get the restaurant slug for per-restaurant Cloudinary folder
  const Restaurant = require('../models/Restaurant');
  const restaurant = await Restaurant.findById(req.restaurantId).select('slug').lean();
  const slug = restaurant ? restaurant.slug : req.restaurantId;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `pravora/${slug}/menu`, public_id: item._id.toString(), overwrite: true },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    item.image = result.secure_url;
    await item.save();
    return successResponse(res, { image: result.secure_url }, 'Image uploaded');
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Image upload failed.', error: err.message });
  }
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getPublicMenu, getItems, createItem, updateItem,
  updateAvailability, updatePrice, deleteItem, uploadItemImage,
};
