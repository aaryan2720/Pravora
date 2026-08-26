const mongoose = require('mongoose');

const hoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' },
    isOpen: { type: Boolean, default: true },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    // ─── Identity ─────────────────────────────────
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    tagline: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },

    // ─── Type & Model ──────────────────────────────
    type: {
      type: String,
      enum: ['cafe', 'quick_service', 'casual_dining', 'premium_dining'],
      default: 'casual_dining',
    },
    serviceModel: {
      type: String,
      enum: ['assisted', 'hybrid', 'self_service'],
      default: 'hybrid',
    },
    cuisine: [{ type: String, trim: true }],

    // ─── Branding ─────────────────────────────────
    brandColor: { type: String, default: '#E96A0A' },
    logo: { type: String, default: null },
    coverImage: { type: String, default: null },
    images: [{ type: String }],

    // ─── Location ─────────────────────────────────
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
      pincode: { type: String, trim: true },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    // ─── Contact ──────────────────────────────────
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
    },

    // ─── Hours ────────────────────────────────────
    hours: {
      mon: hoursSchema,
      tue: hoursSchema,
      wed: hoursSchema,
      thu: hoursSchema,
      fri: hoursSchema,
      sat: hoursSchema,
      sun: hoursSchema,
    },

    // ─── Status ───────────────────────────────────
    isLive: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },

    // ─── Capacity ─────────────────────────────────
    capacity: {
      tables: { type: Number, default: 0 },
      seatsPerTable: { type: Number, default: 4 },
      totalSeats: { type: Number, default: 0 },
    },

    // ─── Settings ─────────────────────────────────
    settings: {
      taxRate: { type: Number, default: 10 },          // percentage
      serviceChargeRate: { type: Number, default: 5 }, // percentage
      reservationsEnabled: { type: Boolean, default: true },
      queueEnabled: { type: Boolean, default: true },
      membershipEnabled: { type: Boolean, default: true },
      aiEnabled: { type: Boolean, default: true },
      requireGuestSignIn: { type: Boolean, default: false },
      qrBaseUrl: { type: String, default: '' },
    },

    // ─── Stats (cached) ───────────────────────────
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    branches: { type: Number, default: 1 },

    // ─── Ownership ────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Onboarding data store ────────────────────
    onboardingData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ─── AI Recommendation ────────────────────────
    aiRecommendation: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geo queries and slug lookups
restaurantSchema.index({ 'location.city': 1 });
restaurantSchema.index({ isLive: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
