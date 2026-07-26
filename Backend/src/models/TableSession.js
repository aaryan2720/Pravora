const mongoose = require('mongoose');

const tableSessionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
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
    guestCount: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 guest required'],
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'billing', 'closed'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    // Summary fields (denormalized for quick access)
    totalOrders: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

tableSessionSchema.index({ restaurantId: 1, status: 1 });
tableSessionSchema.index({ tableId: 1, status: 1 });

module.exports = mongoose.model('TableSession', tableSessionSchema);
