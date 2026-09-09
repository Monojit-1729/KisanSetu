import { Router } from 'express';
import smsController from './sms.controller.js';
import { smsLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// SMS simulation endpoints (prototype demo channel, rate-limited against flood abuse)
router.post('/simulate', smsLimiter, smsController.simulate);
router.get('/history', smsController.getHistory);
router.get('/demo-phones', smsController.getDemoPhones);

export default router;
