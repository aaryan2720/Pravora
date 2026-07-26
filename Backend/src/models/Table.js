const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tableSchema = new mongoose.Schema(
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
    label: {
      type: String,
      required: [true, 'Table label is required'],
      trim: true,
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'Table must have at least 1 seat'],
    },
    // QR token — unique identifier embedded in the QR code URL
    qrToken: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    status: {
      type: String,
      enum: ['free', 'occupied', 'reserved', 'paying', 'dirty'],
      default: 'free',
    },
    currentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableSession',
      default: null,
    },
    // Metadata
    reservationTime: { type: String, default: null },
    guestName: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound index: fast lookup of all tables for a restaurant
tableSchema.index({ restaurantId: 1, label: 1 });
tableSchema.index({ qrToken: 1 });

module.exports = mongoose.model('Table', tableSchema);
