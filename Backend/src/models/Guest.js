const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Guest',
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allow null/undefined (anonymous guests)
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    passwordHash: {
      type: String,
      select: false,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    dietaryPreference: {
      type: String,
      enum: ['none', 'veg', 'vegan', 'gluten_free', 'halal'],
      default: 'none',
    },
    allergies: {
      type: [String],
      default: [],
    },
    // Membership and loyalty across all restaurants
    totalVisits: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastVisitAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

guestSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

guestSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

guestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('Guest', guestSchema);
