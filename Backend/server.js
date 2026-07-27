require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/authRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const onboardingRoutes = require('./src/routes/onboardingRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const tableRoutes = require('./src/routes/tableRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const queueRoutes = require('./src/routes/queueRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const membershipRoutes = require('./src/routes/membershipRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');

const app = express();

// ─── Connect Database & Seed Data ─────────────────────────────────────────────
connectDB().then(() => {
  const seedData = async () => {
    try {
      const User = require('./src/models/User');
      const Restaurant = require('./src/models/Restaurant');
      
      // 1. Seed global admin if not present
      let admin = await User.findOne({ email: 'admin@serveloop.in' });
      if (!admin) {
        admin = await User.create({
          name: 'ServeLoop Admin',
          email: 'admin@serveloop.in',
          passwordHash: 'admin123456',
          role: 'admin',
          restaurantId: null,
          isVerified: true
        });
        console.log('👤 Global Super-Admin seeded: admin@serveloop.in');
      } else {
        if (admin.restaurantId !== null || admin.role !== 'admin') {
          admin.restaurantId = null;
          admin.role = 'admin';
          await admin.save();
          console.log('🔄 Enforced global role and cleared restaurantId on admin account');
        }
      }

      // 2. Check if hello@soracafe.in user exists
      let soraOwner = await User.findOne({ email: 'hello@soracafe.in' });
      if (!soraOwner) {
        soraOwner = new User({
          name: 'Sora Cafe Manager',
          email: 'hello@soracafe.in',
          passwordHash: '123456789',
          role: 'owner',
          isVerified: true
        });
        await soraOwner.save();
        console.log('👤 Sora Cafe Owner seeded: hello@soracafe.in');
      }

      // Ensure no restaurant is owned by the admin user
      if (admin && soraOwner) {
        const ownedRestaurant = await Restaurant.findOne({ owner: admin._id });
        if (ownedRestaurant) {
          ownedRestaurant.owner = soraOwner._id;
          await ownedRestaurant.save();
          console.log(`🔄 Re-assigned ownership of restaurant ${ownedRestaurant.name} from admin to soraOwner`);
        }
      }

      let soraCafe = null;
      if (soraOwner && soraOwner.restaurantId) {
        soraCafe = await Restaurant.findById(soraOwner.restaurantId);
      }
      if (!soraCafe) {
        soraCafe = await Restaurant.findOne({ slug: { $in: ['sora-cafe', 'sora-cafes-restaurant'] } });
      }

      if (!soraCafe) {
        soraCafe = await Restaurant.create({
          slug: 'sora-cafe',
          name: 'Sora Café',
          tagline: 'Modern Dining in Aurangabad',
          type: 'cafe',
          serviceModel: 'hybrid',
          isLive: true,
          onboardingComplete: true,
          owner: soraOwner._id,
          location: {
            address: 'Downtown Street, Aurangabad',
            city: 'Aurangabad',
            state: 'Maharashtra',
            country: 'India',
            pincode: '431001'
          },
          capacity: {
            tables: 8,
            seatsPerTable: 4,
            totalSeats: 32
          }
        });
        console.log('🏢 Sora Café restaurant tenant seeded');
      }

      if (soraOwner && !soraOwner.restaurantId) {
        soraOwner.restaurantId = soraCafe._id;
        await soraOwner.save();
        console.log('🔗 Linked Sora Café owner to restaurantId');
      }
    } catch (err) {
      console.error('❌ Seeding error:', err.message);
    }
  };
  seedData();
});

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());

// CORS — allow frontend origin
const getLocalOrigins = () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const origins = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        origins.push(`http://${iface.address}:3000`);
      }
    }
  }
  return origins;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Dynamically echo requesting origin to allow all sites (works with credentials: true)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter — 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ─── Branded Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'LIVE',
    service: 'ServeLoop Restaurant SaaS API',
    uptime: `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    author: 'ServeLoop Operations',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🍽️   ServeLoop Backend API              ║');
  console.log(`║   🚀  Running on port ${PORT}               ║`);
  console.log(`║   🌍  Mode: ${(process.env.NODE_ENV || 'development').padEnd(28)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
