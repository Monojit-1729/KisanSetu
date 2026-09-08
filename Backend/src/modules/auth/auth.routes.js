import { Router } from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// Public authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected user profile route
router.get('/me', authenticate, authController.getMe);

// Verification route for role-based authorization testing
router.get('/role-check/:role', authenticate, (req, res, next) => {
  return requireRole(req.params.role)(req, res, next);
}, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Access granted for role '${req.params.role}'`,
    user: req.user,
  });
});

export default router;
