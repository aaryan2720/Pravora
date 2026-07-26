const Restaurant = require('../models/Restaurant');
const { successResponse } = require('../utils/helpers');

// ─── POST /api/onboarding/step — Save incremental onboarding step ─────────────
const saveStep = async (req, res) => {
  const { step, data } = req.body;

  const restaurant = await Restaurant.findById(req.restaurantId);
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });

  // Merge step data into onboardingData
  restaurant.onboardingData = { ...restaurant.onboardingData, ...data };
  restaurant.onboardingStep = Math.max(restaurant.onboardingStep, step || 0);

  // Apply top-level restaurant fields from certain steps
  const fieldMap = {
    name: 'name', type: 'type', serviceModel: 'serviceModel',
    cuisine: 'cuisine', location: 'location', contact: 'contact',
    hours: 'hours', capacity: 'capacity', brandColor: 'brandColor',
    tagline: 'tagline', description: 'description',
  };
  Object.keys(fieldMap).forEach((key) => {
    if (data[key] !== undefined) restaurant[fieldMap[key]] = data[key];
  });

  // Settings from relevant steps
  if (data.settings) {
    restaurant.settings = { ...restaurant.settings, ...data.settings };
  }

  await restaurant.save();
  return successResponse(res, { onboardingStep: restaurant.onboardingStep, restaurant }, 'Step saved');
};

// ─── POST /api/onboarding/complete — Finalize onboarding ─────────────────────
const completeOnboarding = async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurantId);
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });

  restaurant.onboardingComplete = true;
  restaurant.isLive = true; // Auto go-live on completion
  await restaurant.save();

  // Trigger AI recommendation in background (non-blocking)
  const { analyzeOnboarding } = require('../services/geminiService');
  analyzeOnboarding(restaurant._id, restaurant.onboardingData)
    .then(async (result) => {
      if (result?.recommendation) {
        await Restaurant.findByIdAndUpdate(restaurant._id, { aiRecommendation: result.recommendation });
      }
    })
    .catch(() => {});

  return successResponse(res, { restaurant }, 'Onboarding complete! Your restaurant is now live.');
};

// ─── GET /api/onboarding/status — Get onboarding state ───────────────────────
const getStatus = async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurantId)
    .select('onboardingComplete onboardingStep onboardingData name slug aiRecommendation')
    .lean();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });
  return successResponse(res, { restaurant }, 'Onboarding status retrieved');
};

module.exports = { saveStep, completeOnboarding, getStatus };
