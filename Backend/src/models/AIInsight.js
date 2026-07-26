const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['onboarding', 'menu', 'operations', 'recommendation', 'summary'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    model: {
      type: String,
      default: 'gemini-1.5-flash',
    },
  },
  {
    timestamps: true,
  }
);

aiInsightSchema.index({ restaurantId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
