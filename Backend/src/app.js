import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/index.js';
import { farmerRoutes } from './modules/farmers/index.js';
import { fpoRoutes } from './modules/fpos/index.js';
import { buyerRoutes } from './modules/buyers/index.js';
import { adminRoutes } from './modules/admin/index.js';
import { lotRoutes } from './modules/lots/index.js';
import { marketRoutes } from './modules/markets/index.js';
import { demandRoutes } from './modules/demand/index.js';
import { matchingRoutes } from './modules/matching/index.js';
import { realizationRoutes } from './modules/realization/index.js';
import { recommendationRoutes } from './modules/recommendations/index.js';
import { offerRoutes } from './modules/offers/index.js';
import { orderRoutes } from './modules/orders/index.js';
import { logisticsRoutes } from './modules/logistics/index.js';
import { paymentRoutes } from './modules/payments/index.js';
import { smsRoutes } from './modules/sms/index.js';
import { analyticsRoutes } from './modules/analytics/index.js';

const app = express();

// Security & Parsing Middleware
const clientUrlEnv = process.env.CLIENT_URL;
const allowedOrigins = clientUrlEnv
  ? clientUrlEnv.split(',').map((u) => u.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, internal health checks)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      (clientUrlEnv && origin === clientUrlEnv.replace(/\/$/, ''));

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Foundation Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'KisanSetu API',
    message: 'KisanSetu backend architecture foundation initialized',
    timestamp: new Date().toISOString()
  });
});

// Modular Service API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/fpos', fpoRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/realization', realizationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired session token';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
});

export default app;
