const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableSession',
      default: null,
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    guestPhone: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      enum: ['service', 'food', 'billing', 'cleanliness', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ restaurantId: 1, status: 1 });
complaintSchema.index({ restaurantId: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
