import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess } from '../utils/response';

export class PaymentController {
 static async handleWebhook(req: Request, res: Response, next: NextFunction) {
 try {
 console.log(' Midtrans Webhook Callback Received:', req.body);
 const result = await OrderService.handleMidtransWebhook(req.body);
 return sendSuccess(res, 'Webhook processed successfully', result);
 } catch (error) {
 next(error);
 }
 }
}
