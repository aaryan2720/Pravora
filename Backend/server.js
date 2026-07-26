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

const app = express();

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

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

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🍽️  ServeLoop API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
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
