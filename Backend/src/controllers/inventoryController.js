const InventoryItem = require('../models/InventoryItem');
const { successResponse } = require('../utils/helpers');

const getInventory = async (req, res) => {
  const { status } = req.query;
  const filter = { restaurantId: req.restaurantId };
  if (status) filter.status = status;
  const items = await InventoryItem.find(filter).sort('name').lean();
  return successResponse(res, { items, total: items.length }, 'Inventory retrieved');
};

const createInventoryItem = async (req, res) => {
  const item = await InventoryItem.create({ ...req.body, restaurantId: req.restaurantId });
  return successResponse(res, { item }, 'Inventory item created', 201);
};

const updateInventoryItem = async (req, res) => {
  const item = await InventoryItem.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  ['name', 'unit', 'current', 'min', 'max', 'notes', 'linkedMenuItems'].forEach((f) => {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  });
  await item.save(); // pre-save hook auto-recomputes status
  return successResponse(res, { item }, 'Inventory updated');
};

const deleteInventoryItem = async (req, res) => {
  const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, restaurantId: req.restaurantId });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  return successResponse(res, {}, 'Inventory item removed');
};

module.exports = { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem };
