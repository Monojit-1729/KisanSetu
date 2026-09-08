import { Router } from 'express';
import matchingController from './matching.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// All matching routes require authentication
router.use(authenticate);

// Buyer endpoint: view matching farmer/FPO lots for a specific demand
router.get('/buyer/:demandId', requireRole('buyer'), matchingController.getMatchesForDemand);

// Farmer/FPO endpoint: summary of matching buyers for all owned active lots
router.get('/my-lots-summary', requireRole('farmer', 'fpo'), matchingController.getMyLotsSummary);

// Farmer/FPO endpoint: view matching buyer demands for a specific lot (read-only)
router.get('/lot/:lotId', requireRole('farmer', 'fpo'), matchingController.getMatchesForLot);

export default router;
