import { Router } from 'express';
import offerController from './offer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// All offer routes require authentication
router.use(authenticate);

// Buyer submits commercial offer on a produce lot
router.post('/', requireRole('buyer'), offerController.createOffer);

// Get current user's sent or received offers
router.get('/my', offerController.getMyOffers);
router.get('/mine', offerController.getMyOffers);

// Get all offers placed on a specific lot (farmer/fpo lot owner)
router.get('/lot/:lotId', requireRole('farmer', 'fpo', 'admin'), offerController.getOffersForLot);

// Single offer details
router.get('/:id', offerController.getOfferById);

// Respond to an offer (accept, reject, counter, withdraw)
router.patch('/:id/respond', offerController.respondToOffer);
router.post('/:id/respond', offerController.respondToOffer);

export default router;
