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

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
