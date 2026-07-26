const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
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
      required: [true, 'Phone number is required'],
      trim: true,
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      default: null,
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party must have at least 1 person'],
    },
    date: {
      type: String, // 'YYYY-MM-DD' stored as string for easy comparison
      required: [true, 'Reservation date is required'],
    },
    time: {
      type: String, // 'HH:MM' format
      required: [true, 'Reservation time is required'],
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'seated', 'no_show'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Staff notes
    staffNotes: {
      type: String,
      trim: true,
      default: '',
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ restaurantId: 1, date: 1, status: 1 });
reservationSchema.index({ restaurantId: 1, createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
