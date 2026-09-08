import { Router } from 'express';
import realizationController from './realization.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Allow authenticated users to query net-realization estimates
router.use(authenticate);

router.post('/estimate', realizationController.estimate);

export default router;
