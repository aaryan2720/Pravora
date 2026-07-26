const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true, // e.g. 'kg', 'L', 'units'
    },
    current: {
      type: Number,
      required: true,
      min: [0, 'Current stock cannot be negative'],
    },
    min: {
      type: Number,
      required: true,
      min: [0, 'Minimum threshold cannot be negative'],
    },
    max: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['ok', 'low', 'critical'],
      default: 'ok',
    },
    linkedMenuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
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

// Auto-compute status before saving
inventoryItemSchema.pre('save', function (next) {
  if (this.current <= 0) {
    this.status = 'critical';
  } else if (this.current < this.min) {
    this.status = 'low';
  } else {
    this.status = 'ok';
  }
  next();
});

inventoryItemSchema.index({ restaurantId: 1, status: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
