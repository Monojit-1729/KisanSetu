import { Router } from 'express';
import orderController from './order.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Create order from accepted offer
router.post('/from-offer/:offerId', orderController.createFromOffer);

// Get my orders (as buyer or seller)
router.get('/my', orderController.getMyOrders);
router.get('/mine', orderController.getMyOrders);

// Single order details
router.get('/:id', orderController.getOrderById);

// Update order status timeline
router.patch('/:id/status', orderController.updateOrderStatus);

export default router;
