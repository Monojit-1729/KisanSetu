import { Router } from 'express';
import recommendationController from './recommendation.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// Protect all recommendation routes
router.use(authenticate);

// Get recommendation opportunities for a specific farmer/fpo lot (accessible to farmer, fpo, or admin)
router.get(
  '/lot/:lotId',
  requireRole('farmer', 'fpo', 'admin'),
  recommendationController.getLotRecommendations
);

export default router;
