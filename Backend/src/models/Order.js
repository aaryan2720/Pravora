const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // price at time of order
    note: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableSession',
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    tableLabel: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'pending',
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    guestNote: {
      type: String,
      trim: true,
      default: '',
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    // Who last updated the status (staff member)
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ sessionId: 1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
