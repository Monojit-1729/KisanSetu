import { Router } from 'express';
import marketController from './market.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All market routes require authentication
router.use(authenticate);

// Metadata
router.get('/crops', marketController.getDistinctCrops);
router.get('/districts', marketController.getDistinctDistricts);

// Time-series price query: ?cropName=Wheat&district=Nashik&days=30
router.get('/prices', marketController.getPrices);

// Latest price per crop for a district: ?district=Nashik
router.get('/latest', marketController.getLatestByDistrict);

// Single crop latest price for dashboard widget: ?cropName=Wheat&district=Nashik
router.get('/crop-price', marketController.getLatestPriceForCrop);

export default router;
