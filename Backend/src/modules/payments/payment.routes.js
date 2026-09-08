import { Router } from 'express';
import paymentController from './payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All payment tracking routes require authentication
router.use(authenticate);

// Initialize payment record for order
router.post('/', paymentController.createPayment);

// Retrieve payment status for an order
router.get('/order/:orderId', paymentController.getByOrderId);

// Update payment status (advance simulated settlement)
router.patch('/:id/status', paymentController.updateStatus);

export default router;
