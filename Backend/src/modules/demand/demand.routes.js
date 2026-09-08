import { Router } from 'express';
import demandController from './demand.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// All demand routes require authentication
router.use(authenticate);

// Metadata routes (must come before /:id)
router.get('/meta/crops', demandController.getDistinctCrops);
router.get('/meta/districts', demandController.getDistinctDistricts);

// Buyer-specific routes (must come before /:id)
router.get('/my', requireRole('buyer'), demandController.getMyDemands);
router.get('/stats', requireRole('buyer'), demandController.getMyStats);

// Create demand (Buyer only)
router.post('/', requireRole('buyer'), demandController.createDemand);

// Browse/list demands (All authenticated users)
router.get('/', demandController.listDemands);

// Single demand detail (All authenticated users)
router.get('/:id', demandController.getDemandById);

// Update demand (Buyer only, ownership enforced in service)
router.patch('/:id', requireRole('buyer'), demandController.updateDemand);

// Delete/cancel demand (Buyer only, ownership enforced in service)
router.delete('/:id', requireRole('buyer'), demandController.deleteDemand);

export default router;
