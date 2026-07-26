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

  // Safely normalize name, type, serviceModel, brandColor, logo, description, branches
  if (data.name) restaurant.name = data.name;
  if (data.type) restaurant.type = data.type;
  if (data.serviceModel) restaurant.serviceModel = data.serviceModel;
  if (data.brandColor) restaurant.brandColor = data.brandColor;
  if (data.logo) restaurant.logo = data.logo;
  if (data.description) restaurant.description = data.description;
  if (data.branches !== undefined) restaurant.branches = Number(data.branches);
  if (data.cuisine) restaurant.cuisine = Array.isArray(data.cuisine) ? data.cuisine : [data.cuisine];

  // Restructure location string/object
  if (data.location !== undefined || data.city !== undefined) {
    restaurant.location = {
      address: typeof data.location === 'object' ? (data.location.address || '') : (data.location || ''),
      city: typeof data.location === 'object' ? (data.location.city || '') : (data.city || ''),
      country: 'India'
    };
  }

  // Restructure contact parameters
  if (data.phone || data.email || data.website) {
    restaurant.contact = {
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || ''
    };
  }

  // Normalize operating hours structure
  if (data.hours) {
    const normHours = {};
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach(day => {
      const srcKey = Object.keys(data.hours).find(k => k.toLowerCase() === day);
      if (srcKey) {
        const h = data.hours[srcKey];
        normHours[day] = {
          open: h.from || '11:00',
          close: h.to || '23:00',
          isOpen: h.open !== undefined ? h.open : true
        };
      }
    });
    restaurant.hours = normHours;
  }

  // Normalize settings
  if (data.settings || data.taxRate !== undefined || data.serviceChargeRate !== undefined) {
    restaurant.settings = {
      taxRate: data.taxRate !== undefined ? Number(data.taxRate) : (data.settings?.taxRate !== undefined ? Number(data.settings.taxRate) : restaurant.settings.taxRate),
      serviceChargeRate: data.serviceChargeRate !== undefined ? Number(data.serviceChargeRate) : (data.settings?.serviceChargeRate !== undefined ? Number(data.settings.serviceChargeRate) : restaurant.settings.serviceChargeRate),
      reservationsEnabled: data.reservationsEnabled !== undefined ? Boolean(data.reservationsEnabled) : (data.settings?.reservationsEnabled !== undefined ? Boolean(data.settings.reservationsEnabled) : restaurant.settings.reservationsEnabled),
      queueEnabled: data.queueEnabled !== undefined ? Boolean(data.queueEnabled) : (data.settings?.queueEnabled !== undefined ? Boolean(data.settings.queueEnabled) : restaurant.settings.queueEnabled),
      membershipEnabled: data.membershipEnabled !== undefined ? Boolean(data.membershipEnabled) : (data.settings?.membershipEnabled !== undefined ? Boolean(data.settings.membershipEnabled) : restaurant.settings.membershipEnabled),
      aiEnabled: data.aiEnabled !== undefined ? Boolean(data.aiEnabled) : (data.settings?.aiEnabled !== undefined ? Boolean(data.settings.aiEnabled) : restaurant.settings.aiEnabled),
      requireGuestSignIn: data.requireGuestSignIn !== undefined ? Boolean(data.requireGuestSignIn) : (data.settings?.requireGuestSignIn !== undefined ? Boolean(data.settings.requireGuestSignIn) : restaurant.settings.requireGuestSignIn),
    };
  }

  // Normalize capacity
  if (data.capacity || data.tables !== undefined || data.seatsPerTable !== undefined) {
    const tbls = data.tables !== undefined ? Number(data.tables) : (data.capacity?.tables !== undefined ? Number(data.capacity.tables) : restaurant.capacity.tables);
    const seats = data.seatsPerTable !== undefined ? Number(data.seatsPerTable) : (data.capacity?.seatsPerTable !== undefined ? Number(data.capacity.seatsPerTable) : restaurant.capacity.seatsPerTable);
    restaurant.capacity = {
      tables: tbls,
      seatsPerTable: seats,
      totalSeats: tbls * seats
    };
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

  // Auto-generate tables in database if none exist yet
  try {
    const Table = require('../models/Table');
    const existingTablesCount = await Table.countDocuments({ restaurantId: restaurant._id, isActive: true });
    if (existingTablesCount === 0) {
      const tableCount = restaurant.capacity?.tables || 12;
      const prefix = restaurant.onboardingData?.tables?.namingScheme || 'T';
      const seats = restaurant.capacity?.seatsPerTable || 4;
      const tablesToCreate = [];
      for (let i = 1; i <= tableCount; i++) {
        tablesToCreate.push({
          restaurantId: restaurant._id,
          label: `${prefix}${i}`,
          seats: seats,
          status: 'free',
          isActive: true
        });
      }
      await Table.insertMany(tablesToCreate);
    }
  } catch (err) {
    console.error('Error auto-generating tables:', err);
  }

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
