const Order = require('../models/Order');
const Bill = require('../models/Bill');
const TableSession = require('../models/TableSession');
const InventoryItem = require('../models/InventoryItem');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
const { getTodayDateString, successResponse } = require('../utils/helpers');

// ─── GET /api/analytics/today ─────────────────────────────────────────────────
const getTodayAnalytics = async (req, res) => {
  const restaurantId = req.restaurantId;
  const today = getTodayDateString();

  // All bills paid today
  const todayStart = new Date(today + 'T00:00:00.000Z');
  const todayEnd = new Date(today + 'T23:59:59.999Z');

  const [bills, orders, sessions] = await Promise.all([
    Bill.find({ restaurantId, status: 'paid', paidAt: { $gte: todayStart, $lte: todayEnd } }).lean(),
    Order.find({ restaurantId, createdAt: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } }).lean(),
    TableSession.find({ restaurantId, closedAt: { $gte: todayStart, $lte: todayEnd } }).lean(),
  ]);

  const revenue = bills.reduce((s, b) => s + b.total, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;
  const tablesTurned = sessions.length;

  // Top items
  const itemMap = {};
  orders.forEach((o) => {
    o.items.forEach((i) => {
      if (!itemMap[i.name]) itemMap[i.name] = { name: i.name, count: 0, revenue: 0 };
      itemMap[i.name].count += i.qty;
      itemMap[i.name].revenue += i.price * i.qty;
    });
  });
  const topItems = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // Peak hours (orders per hour)
  const peakHours = Array.from({ length: 14 }, (_, i) => {
    const hour = String(i + 9).padStart(2, '0'); // 09:00 to 22:00
    const count = orders.filter((o) => new Date(o.placedAt).getHours() === i + 9).length;
    return { hour, orders: count };
  });

  return successResponse(res, {
    today: { revenue, orders: orderCount, avgOrderValue, tablesTurned, topItems, peakHours },
  }, 'Today\'s analytics retrieved');
};

// ─── GET /api/analytics/week ──────────────────────────────────────────────────
const getWeekAnalytics = async (req, res) => {
  const restaurantId = req.restaurantId;
  const labels = [];
  const revenueData = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];

    const dayStart = new Date(dateStr + 'T00:00:00.000Z');
    const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

    const dayBills = await Bill.find({
      restaurantId, status: 'paid',
      paidAt: { $gte: dayStart, $lte: dayEnd },
    }).select('total').lean();

    const dayRevenue = dayBills.reduce((s, b) => s + b.total, 0);
    labels.push(dayName);
    revenueData.push(dayRevenue);
  }

  return successResponse(res, { week: { labels, revenue: revenueData } }, 'Weekly analytics retrieved');
};

// ─── GET /api/analytics/month ─────────────────────────────────────────────────
const getMonthAnalytics = async (req, res) => {
  const restaurantId = req.restaurantId;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bills, orders] = await Promise.all([
    Bill.find({ restaurantId, status: 'paid', paidAt: { $gte: monthStart } }).select('total guestId').lean(),
    Order.find({ restaurantId, createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } }).lean(),
  ]);

  const revenue = bills.reduce((s, b) => s + b.total, 0);
  const guestIds = [...new Set(bills.filter((b) => b.guestId).map((b) => b.guestId.toString()))];

  return successResponse(res, {
    month: {
      revenue,
      ordersTotal: orders.length,
      newCustomers: guestIds.length,
    },
  }, 'Monthly analytics retrieved');
};

// ─── GET /api/analytics/pulse — Real-time pulse dashboard data ────────────────
const getPulse = async (req, res) => {
  const restaurantId = req.restaurantId;
  const today = getTodayDateString();
  const todayStart = new Date(today + 'T00:00:00.000Z');

  const [
    activeTables, pendingOrders, preparingOrders, lowStock, criticalStock,
    todayBills, activeSessions,
  ] = await Promise.all([
    TableSession.countDocuments({ restaurantId, status: 'active' }),
    Order.countDocuments({ restaurantId, status: 'pending' }),
    Order.countDocuments({ restaurantId, status: 'preparing' }),
    InventoryItem.countDocuments({ restaurantId, status: 'low' }),
    InventoryItem.countDocuments({ restaurantId, status: 'critical' }),
    Bill.find({ restaurantId, status: 'paid', paidAt: { $gte: todayStart } }).select('total').lean(),
    TableSession.find({ restaurantId, status: { $in: ['active', 'billing'] } })
      .select('startedAt')
      .lean(),
  ]);

  const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0);
  const tablesTurnedToday = todayBills.length;

  // Rush level: based on active orders + occupied tables (0-100)
  const activeOrders = pendingOrders + preparingOrders;
  const rushLevel = Math.min(100, Math.round((activeOrders * 8) + (activeTables * 4)));

  // Average wait time estimate
  const avgWaitTime = activeOrders > 0 ? Math.round(activeOrders * 2.5) : 0;

  return successResponse(res, {
    pulse: {
      rushLevel,
      activeOrders,
      activeTables,
      pendingOrders,
      lowStockItems: lowStock,
      criticalItems: criticalStock,
      todayRevenue,
      tablesTurnedToday,
      avgWaitTime,
    },
  }, 'Pulse data retrieved');
};

const getSaaSAnalytics = async (req, res) => {
  const Restaurant = require('../models/Restaurant');
  const Table = require('../models/Table');
  const Reservation = require('../models/Reservation');
  const Complaint = require('../models/Complaint');
  const Order = require('../models/Order');

  const [
    restaurants,
    tablesCount,
    activeSessions,
    bills,
    recentSessions,
    recentReservations,
    allComplaints,
    recentOrders
  ] = await Promise.all([
    Restaurant.find().lean(),
    Table.countDocuments(),
    TableSession.find({ status: 'active' }).populate('restaurantId', 'name').lean(),
    Bill.find({ status: 'paid' }).select('total').lean(),
    TableSession.find()
      .populate('restaurantId', 'name')
      .populate('tableId', 'label')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Reservation.find()
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Complaint.find()
      .populate('restaurantId', 'name')
      .populate('tableId', 'label')
      .sort({ createdAt: -1 })
      .lean(),
    Order.find()
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean()
  ]);

  const totalRevenue = bills.reduce((s, b) => s + b.total, 0);
  const totalRestaurants = restaurants.length;

  const partnerCafes = restaurants.map(r => {
    const activeCount = activeSessions.filter(s => {
      const sRestId = s.restaurantId?._id?.toString() || s.restaurantId?.toString();
      return sRestId === r._id.toString();
    }).length;
    return {
      _id: r._id,
      name: r.name,
      slug: r.slug,
      logo: r.logo,
      coverImage: r.coverImage,
      tagline: r.tagline,
      cuisine: r.cuisine || [],
      city: r.location?.city || 'Aurangabad',
      address: r.location?.address || '',
      activeTables: activeCount,
      isOnboarded: r.isOnboarded ?? true,
      createdAt: r.createdAt
    };
  });

  return successResponse(res, {
    saas: {
      totalRestaurants,
      totalTables: tablesCount,
      activeSessionsCount: activeSessions.length,
      totalRevenue,
      partnerCafes,
      recentSessions,
      recentReservations,
      complaints: allComplaints,
      recentOrders
    }
  }, 'SaaS global analytics retrieved');
};

module.exports = { getTodayAnalytics, getWeekAnalytics, getMonthAnalytics, getPulse, getSaaSAnalytics };

