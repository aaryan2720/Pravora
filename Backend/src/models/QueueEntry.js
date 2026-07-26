const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
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
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party must have at least 1 person'],
    },
    token: {
      type: String,
      required: true, // e.g. 'Q01', 'Q02'
    },
    estimatedWait: {
      type: Number, // minutes
      default: 15,
    },
    status: {
      type: String,
      enum: ['waiting', 'seated', 'left', 'cancelled'],
      default: 'waiting',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    seatedAt: {
      type: Date,
      default: null,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

queueEntrySchema.index({ restaurantId: 1, status: 1, joinedAt: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
