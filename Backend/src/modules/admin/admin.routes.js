import { Router } from 'express';
import adminController from './admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// Enforce authentication and admin role
router.use(authenticate, requireRole('admin'));

router.get('/overview', adminController.getOverview);

export default router;
