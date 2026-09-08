import { Router } from 'express';
import farmerController from './farmer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// Enforce authentication and farmer role on all farmer routes
router.use(authenticate, requireRole('farmer'));

router.get('/me', farmerController.getMe);
router.post('/profile', farmerController.updateProfile);
router.patch('/profile', farmerController.updateProfile);

export default router;
