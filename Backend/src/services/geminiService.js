const { getGeminiModel } = require('../config/gemini');
const AIInsight = require('../models/AIInsight');

// ─── Fallback responses when AI is unavailable ────────────────────────────────
const FALLBACKS = {
  onboarding: {
    recommendation: 'Based on your restaurant profile, we recommend starting with digital menu and QR table sessions. Enable reservations for better table management and use the pulse dashboard to monitor peak hours.',
    workflowSuggestion: 'hybrid',
    topFeatures: ['digital-menu', 'qr-sessions', 'reservations', 'analytics'],
  },
  menu: 'Your menu looks great! Consider highlighting your bestsellers and adding allergen information to all items for a better guest experience.',
  operations: 'Operations are running. Monitor your peak hours carefully and keep inventory levels above minimum thresholds to avoid stockouts.',
  recommendation: 'Based on popular items, we recommend trying our bestsellers. Check the specials section for today\'s featured dishes.',
  summary: 'Daily operations completed. Review your analytics dashboard for detailed insights.',
};

/**
 * callGemini — internal helper that calls Gemini and saves the insight.
 * Returns fallback if AI is unavailable or fails.
 */
const callGemini = async (restaurantId, type, promptText) => {
  const model = getGeminiModel();

  if (!model) {
    console.warn('⚠️  Gemini not configured. Returning fallback response.');
    return { response: FALLBACKS[type] || FALLBACKS.summary, fromFallback: true };
  }

  try {
    const result = await model.generateContent(promptText);
    const response = result.response.text();

    // Persist the insight for audit/replay
    await AIInsight.create({
      restaurantId,
      type,
      prompt: promptText,
      response,
    });

    return { response, fromFallback: false };
  } catch (err) {
    console.error(`❌  Gemini API error (type: ${type}):`, err.message);
    return { response: FALLBACKS[type] || FALLBACKS.summary, fromFallback: true };
  }
};

/**
 * analyzeOnboarding — send restaurant onboarding data to Gemini
 * and get a recommended workflow and feature mix.
 */
const analyzeOnboarding = async (restaurantId, onboardingData) => {
  const prompt = `
You are a restaurant operations expert. Analyze this restaurant's onboarding data and provide a concise setup recommendation.

Restaurant Data:
${JSON.stringify(onboardingData, null, 2)}

Respond in JSON format with these fields:
{
  "recommendation": "A 2-3 sentence operational recommendation tailored to this restaurant type and service model",
  "workflowSuggestion": "one of: assisted | hybrid | self_service",
  "topFeatures": ["list", "of", "3-5", "key", "feature", "slugs"],
  "readinessScore": 0-100,
  "tips": ["2-3 short actionable tips for launch"]
}

Only respond with valid JSON. No markdown, no explanation text outside the JSON.
`.trim();

  const { response, fromFallback } = await callGemini(restaurantId, 'onboarding', prompt);

  if (fromFallback) return FALLBACKS.onboarding;

  try {
    // Strip markdown code fences if present
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return FALLBACKS.onboarding;
  }
};

/**
 * generateMenuInsights — ask Gemini to suggest menu improvements.
 */
const generateMenuInsights = async (restaurantId, menuData) => {
  const prompt = `
You are a restaurant menu consultant. Review this restaurant's menu data and provide helpful insights.

Menu Data (sample):
${JSON.stringify(menuData, null, 2)}

Provide 3-5 concise, actionable insights about:
- Pricing gaps or opportunities
- Availability optimization
- Missing popular categories
- Bestseller highlighting suggestions

Format as a plain text paragraph. Keep it under 200 words.
`.trim();

  const { response } = await callGemini(restaurantId, 'menu', prompt);
  return response;
};

/**
 * generateOperationsSummary — daily operations intelligence.
 */
const generateOperationsSummary = async (restaurantId, analyticsData) => {
  const prompt = `
You are a restaurant operations analyst. Based on today's data, generate a brief daily summary.

Today's Data:
${JSON.stringify(analyticsData, null, 2)}

Write a concise 3-4 sentence operational summary highlighting:
- Revenue performance
- Busy periods
- Any concerns (low stock, delays)
- One improvement suggestion

Keep it conversational and under 150 words.
`.trim();

  const { response } = await callGemini(restaurantId, 'operations', prompt);
  return response;
};

/**
 * generateCustomerRecommendation — personalized item suggestions for a guest.
 */
const generateCustomerRecommendation = async (restaurantId, guestHistory, availableItems) => {
  const prompt = `
You are a friendly restaurant assistant. Based on a guest's order history and the current menu, suggest 2-3 items they might enjoy.

Guest History: ${JSON.stringify(guestHistory || {}, null, 2)}
Available Items (sample): ${JSON.stringify(availableItems.slice(0, 15), null, 2)}

Write a short, friendly recommendation message (2-3 sentences) suggesting specific items from the menu by name.
Do not mention items that are unavailable. Keep it warm and appetizing.
`.trim();

  const { response } = await callGemini(restaurantId, 'recommendation', prompt);
  return response;
};

module.exports = {
  analyzeOnboarding,
  generateMenuInsights,
  generateOperationsSummary,
  generateCustomerRecommendation,
};
