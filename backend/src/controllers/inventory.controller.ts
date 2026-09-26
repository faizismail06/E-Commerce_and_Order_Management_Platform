import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { adjustStockSchema, inventoryQuerySchema } from '../validators/inventory.validator';
import { sendSuccess } from '../utils/response';

export class InventoryController {
 static async getInventory(req: Request, res: Response, next: NextFunction) {
 try {
 const queryParams = inventoryQuerySchema.parse(req.query);
 const result = await InventoryService.getInventory(queryParams);
 return sendSuccess(
 res,
 'Inventory stock audit list retrieved',
 { items: result.items, summary: result.summary },
 200,
 result.meta
 );
 } catch (error) {
 next(error);
 }
 }

 static async adjustStock(req: Request, res: Response, next: NextFunction) {
 try {
 const adminUserId = req.user!.userId;
 const validated = adjustStockSchema.parse(req.body);
 const result = await InventoryService.adjustStock(adminUserId, validated);
 return sendSuccess(res, 'Stock level adjusted successfully', result);
 } catch (error) {
 next(error);
 }
 }

 static async getMovements(req: Request, res: Response, next: NextFunction) {
 try {
 const productId = req.query.productId as string | undefined;
 const movements = await InventoryService.getMovements(productId);
 return sendSuccess(res, 'Inventory movement logs retrieved', movements);
 } catch (error) {
 next(error);
 }
 }

 static async triggerExpiredScan(req: Request, res: Response, next: NextFunction) {
 try {
 const result = await InventoryService.processExpiredPendingOrders();
 return sendSuccess(res, 'Expired pending payment orders processed', result);
 } catch (error) {
 next(error);
 }
 }
}
