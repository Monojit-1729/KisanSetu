import { Router } from 'express';
import buyerController from './buyer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// Enforce authentication and buyer role
router.use(authenticate, requireRole('buyer'));

router.get('/me', buyerController.getMe);
router.post('/profile', buyerController.updateProfile);
router.patch('/profile', buyerController.updateProfile);

export default router;
