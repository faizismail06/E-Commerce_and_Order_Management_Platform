import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// Public Webhook Notification Callback from Midtrans Gateway
router.post('/webhook', PaymentController.handleWebhook);

export default router;
