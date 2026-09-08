import { Router } from 'express';
import analyticsController from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Time-series price trends & inline short-horizon forecast: ?cropName=Tomato&district=Nashik&days=30
router.get('/price-trends', analyticsController.getPriceTrends);

// Cross-market comparison for a crop: ?cropName=Tomato&primaryDistrict=Nashik
router.get('/compare', analyticsController.getMarketComparison);

// Dedicated short-horizon forecast endpoint: ?cropName=Tomato&district=Nashik
router.get('/forecast', analyticsController.getForecast);

export default router;
