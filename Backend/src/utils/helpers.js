/**
 * slugify — converts a string to a URL-safe slug.
 * Uses the npm slugify package for consistent output.
 */
const slugifyLib = require('slugify');

const makeSlug = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * getTodayDateString — returns today's date in 'YYYY-MM-DD' format (UTC).
 */
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * generateQueueToken — generates a queue token like 'Q01', 'Q02', etc.
 * @param {number} position - 1-based position
 */
const generateQueueToken = (position) => {
  return `Q${String(position).padStart(2, '0')}`;
};

/**
 * calcBillAmounts — compute tax and service charge from subtotal.
 * @param {number} subtotal
 * @param {number} taxRate - percentage (e.g. 10 for 10%)
 * @param {number} serviceChargeRate - percentage (e.g. 5 for 5%)
 */
const calcBillAmounts = (subtotal, taxRate = 10, serviceChargeRate = 5, discountAmount = 0) => {
  const discounted = subtotal - discountAmount;
  const taxAmount = Math.round((discounted * taxRate) / 100 * 100) / 100;
  const serviceChargeAmount = Math.round((discounted * serviceChargeRate) / 100 * 100) / 100;
  const total = Math.round((discounted + taxAmount + serviceChargeAmount) * 100) / 100;
  return { taxAmount, serviceChargeAmount, total };
};

/**
 * paginate — extracts pagination params from query string.
 */
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * successResponse — standard success response shape.
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

module.exports = {
  makeSlug,
  getTodayDateString,
  generateQueueToken,
  calcBillAmounts,
  paginate,
  successResponse,
};
