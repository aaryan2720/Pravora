const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    points: {
      type: Number,
      default: 0,
    },
    visits: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastVisitAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique membership per guest per restaurant
membershipSchema.index({ guestId: 1, restaurantId: 1 }, { unique: true });
membershipSchema.index({ restaurantId: 1, tier: 1 });

// Auto-upgrade tier based on points
membershipSchema.pre('save', function (next) {
  if (this.points >= 5000) this.tier = 'platinum';
  else if (this.points >= 2000) this.tier = 'gold';
  else if (this.points >= 500) this.tier = 'silver';
  else this.tier = 'bronze';
  next();
});

module.exports = mongoose.model('Membership', membershipSchema);
