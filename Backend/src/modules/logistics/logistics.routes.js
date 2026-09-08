import { Router } from 'express';
import logisticsController from './logistics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All logistics endpoints require authentication
router.use(authenticate);

// Prototype estimate endpoint
router.post('/estimate', logisticsController.estimate);

// Initialize logistics record for an order
router.post('/', logisticsController.createLogistics);

// Retrieve logistics for an order
router.get('/order/:orderId', logisticsController.getByOrderId);

// Update logistics status
router.patch('/:id/status', logisticsController.updateStatus);

// Update general logistics metadata
router.patch('/:id', logisticsController.updateLogistics);

export default router;
