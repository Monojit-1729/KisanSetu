import { Router } from 'express';
import fpoController from './fpo.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// Enforce authentication and FPO role
router.use(authenticate, requireRole('fpo'));

router.get('/me', fpoController.getMe);
router.post('/profile', fpoController.updateProfile);
router.patch('/profile', fpoController.updateProfile);

export default router;
