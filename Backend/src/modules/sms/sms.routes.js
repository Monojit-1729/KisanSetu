import { Router } from 'express';
import smsController from './sms.controller.js';

const router = Router();

// SMS simulation endpoints (prototype demo channel)
router.post('/simulate', smsController.simulate);
router.get('/history', smsController.getHistory);
router.get('/demo-phones', smsController.getDemoPhones);

export default router;
