import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import {
 shipOrderSchema,
 updateOrderStatusSchema,
 adminOrderQuerySchema,
} from '../validators/admin.validator';
import { sendSuccess } from '../utils/response';

export class AdminController {
 // Orders
 static async getOrders(req: Request, res: Response, next: NextFunction) {
 try {
 const queryParams = adminOrderQuerySchema.parse(req.query);
 const result = await AdminService.getAdminOrders(queryParams);
 return sendSuccess(
 res,
 'Admin order list retrieved successfully',
 result.orders,
 200,
 result.meta
 );
 } catch (error) {
 next(error);
 }
 }

 static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
 try {
 const adminUserId = req.user!.userId;
 const id = req.params.id as string;
 const { status } = updateOrderStatusSchema.parse(req.body);

 const order = await AdminService.updateOrderStatus(adminUserId, id, status);
 return sendSuccess(res, `Order status updated to ${status}`, order);
 } catch (error) {
 next(error);
 }
 }

 static async shipOrder(req: Request, res: Response, next: NextFunction) {
 try {
 const adminUserId = req.user!.userId;
 const id = req.params.id as string;
 const validated = shipOrderSchema.parse(req.body);

 const order = await AdminService.shipOrder(adminUserId, id, validated);
 return sendSuccess(res, 'Order marked as SHIPPED with tracking info', order);
 } catch (error) {
 next(error);
 }
 }

 // Customers
 static async getCustomers(req: Request, res: Response, next: NextFunction) {
 try {
 const search = (req.query.search as string) || '';
 const customers = await AdminService.getCustomers(search);
 return sendSuccess(res, 'Customer list retrieved successfully', customers);
 } catch (error) {
 next(error);
 }
 }

 static async toggleCustomerStatus(req: Request, res: Response, next: NextFunction) {
 try {
 const adminUserId = req.user!.userId;
 const id = req.params.id as string;

 const customer = await AdminService.toggleCustomerStatus(adminUserId, id);
 const statusText = customer.isActive ? 'ACTIVATED' : 'DEACTIVATED';
 return sendSuccess(res, `Customer account ${statusText} successfully`, customer);
 } catch (error) {
 next(error);
 }
 }

 // Dashboard Metrics
 static async getDashboardMetrics(_req: Request, res: Response, next: NextFunction) {
 try {
 const metrics = await AdminService.getDashboardMetrics();
 return sendSuccess(res, 'Dashboard metrics retrieved successfully', metrics);
 } catch (error) {
 next(error);
 }
 }
}

