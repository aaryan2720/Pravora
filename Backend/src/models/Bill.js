const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
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
      unique: true, // one bill per session
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
    // Snapshot of orders at bill time (denormalized for receipt)
    orderSnapshots: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId },
        items: [
          {
            name: String,
            qty: Number,
            price: Number,
            total: Number,
          },
        ],
        subtotal: Number,
        _id: false,
      },
    ],
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 10 },            // percentage
    taxAmount: { type: Number, required: true },
    serviceChargeRate: { type: Number, default: 5 },  // percentage
    serviceChargeAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', null],
      default: null,
    },
    paidAt: { type: Date, default: null },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Guest reference for loyalty tracking
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

billSchema.index({ restaurantId: 1, createdAt: -1 });
billSchema.index({ restaurantId: 1, status: 1 });

module.exports = mongoose.model('Bill', billSchema);
