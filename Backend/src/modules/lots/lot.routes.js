import { Router } from 'express';
import lotController from './lot.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// All lot routes require authentication
router.use(authenticate);

// Metadata routes (before /:id to avoid param conflicts)
router.get('/meta/crops', lotController.getDistinctCrops);
router.get('/meta/districts', lotController.getDistinctDistricts);

// Farmer/FPO-only stats
router.get('/stats', requireRole('farmer', 'fpo'), lotController.getMyStats);

// Farmer/FPO-only: my lots
router.get('/mine', requireRole('farmer', 'fpo'), lotController.getMyLots);

// Farmer/FPO-only: create lot
router.post('/', requireRole('farmer', 'fpo'), lotController.createLot);

// All authenticated users: browse active lots
router.get('/', lotController.listActiveLots);

// All authenticated users: single lot detail
router.get('/:id', lotController.getLotById);

// Farmer/FPO-only: update lot (owner-only enforced in service)
router.patch('/:id', requireRole('farmer', 'fpo'), lotController.updateLot);

// Farmer/FPO-only: close lot (owner-only enforced in service)
router.post('/:id/close', requireRole('farmer', 'fpo'), lotController.closeLot);

export default router;
