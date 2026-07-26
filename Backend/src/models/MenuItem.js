const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null, // null means no discount
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    // Three-state availability system
    availability: {
      type: String,
      enum: ['available', 'unavailable', 'soon'],
      default: 'available',
    },
    prepTime: {
      type: Number, // minutes
      default: 10,
      min: [0, 'Prep time cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }],
    spiceLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ restaurantId: 1, categoryId: 1, sortOrder: 1 });
menuItemSchema.index({ restaurantId: 1, availability: 1 });
menuItemSchema.index({ restaurantId: 1, isSpecial: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
