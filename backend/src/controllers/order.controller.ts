import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema } from '../validators/order.validator';
import { sendSuccess } from '../utils/response';

export class OrderController {
 static async createOrder(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const validated = createOrderSchema.parse(req.body);
 const result = await OrderService.createOrder(userId, validated);
 return sendSuccess(res, 'Order created successfully', result, 201);
 } catch (error) {
 next(error);
 }
 }

 static async getOrders(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const orders = await OrderService.getOrders(userId);
 return sendSuccess(res, 'Customer orders retrieved successfully', orders);
 } catch (error) {
 next(error);
 }
 }

 static async getOrderById(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';

 const order = await OrderService.getOrderById(id, isStaff ? undefined : userId);
 return sendSuccess(res, 'Order detail retrieved successfully', order);
 } catch (error) {
 next(error);
 }
 }

 static async cancelOrder(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const order = await OrderService.cancelOrder(userId, id);
 return sendSuccess(res, 'Order cancelled successfully', order);
 } catch (error) {
 next(error);
 }
 }
}
