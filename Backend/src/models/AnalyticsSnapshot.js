const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    revenue: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    tablesTurned: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
    topItems: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        count: Number,
        revenue: Number,
        _id: false,
      },
    ],
    peakHours: [
      {
        hour: String,
        orders: Number,
        _id: false,
      },
    ],
    reservations: { type: Number, default: 0 },
    queueEntries: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    // Rush level at end of day (0-100)
    rushLevelPeak: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Unique snapshot per restaurant per day
analyticsSnapshotSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
