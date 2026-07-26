const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const {
  analyzeOnboarding,
  generateMenuInsights,
  generateOperationsSummary,
  generateCustomerRecommendation,
} = require('../services/geminiService');
const { successResponse } = require('../utils/helpers');

// ─── POST /api/ai/onboarding-summary ─────────────────────────────────────────
const onboardingSummary = async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurantId).lean();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });

  const result = await analyzeOnboarding(req.restaurantId, {
    type: restaurant.type,
    serviceModel: restaurant.serviceModel,
    cuisine: restaurant.cuisine,
    capacity: restaurant.capacity,
    settings: restaurant.settings,
    onboardingData: restaurant.onboardingData,
  });

  // Save recommendation back to restaurant
  if (result.recommendation) {
    await Restaurant.findByIdAndUpdate(req.restaurantId, {
      aiRecommendation: result.recommendation,
    });
  }

  return successResponse(res, { result }, 'Onboarding analysis complete');
};

// ─── POST /api/ai/menu-insights ───────────────────────────────────────────────
const menuInsights = async (req, res) => {
  const items = await MenuItem.find({ restaurantId: req.restaurantId, isActive: true })
    .select('name price availability isSpecial rating tags')
    .limit(30)
    .lean();

  const result = await generateMenuInsights(req.restaurantId, items);
  return successResponse(res, { insight: result }, 'Menu insights generated');
};

// ─── POST /api/ai/operations-summary ─────────────────────────────────────────
const operationsSummary = async (req, res) => {
  const { analyticsData } = req.body;
  const result = await generateOperationsSummary(req.restaurantId, analyticsData || {});
  return successResponse(res, { summary: result }, 'Operations summary generated');
};

// ─── POST /api/ai/recommendation — For customer ──────────────────────────────
const customerRecommendation = async (req, res) => {
  const { restaurantId, guestHistory } = req.body;
  const items = await MenuItem.find({
    restaurantId,
    isActive: true,
    availability: 'available',
  })
    .select('name price isVeg tags spiceLevel')
    .limit(20)
    .lean();

  const result = await generateCustomerRecommendation(restaurantId, guestHistory || {}, items);
  return successResponse(res, { recommendation: result }, 'Recommendation generated');
};

module.exports = { onboardingSummary, menuInsights, operationsSummary, customerRecommendation };
