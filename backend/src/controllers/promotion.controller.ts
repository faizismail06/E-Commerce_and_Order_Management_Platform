import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../services/promotion.service';
import { applyCouponSchema, createPromotionSchema } from '../validators/promotion.validator';
import { sendSuccess } from '../utils/response';

export class PromotionController {
 static async applyCoupon(req: Request, res: Response, next: NextFunction) {
 try {
 const { code, subtotal } = applyCouponSchema.parse(req.body);
 const result = await PromotionService.validateAndApplyCoupon(code, subtotal);
 return sendSuccess(res, `Coupon ${code} applied successfully!`, result);
 } catch (error) {
 next(error);
 }
 }

 // Admin Controller Endpoints
 static async getPromotions(_req: Request, res: Response, next: NextFunction) {
 try {
 const promotions = await PromotionService.getPromotions();
 return sendSuccess(res, 'Promotions list retrieved successfully', promotions);
 } catch (error) {
 next(error);
 }
 }

 static async createPromotion(req: Request, res: Response, next: NextFunction) {
 try {
 const adminUserId = req.user!.userId;
 const validated = createPromotionSchema.parse(req.body);
 const promo = await PromotionService.createPromotion(adminUserId, validated);
 return sendSuccess(res, 'Promotion code created successfully', promo, 201);
 } catch (error) {
 next(error);
 }
 }

 static async togglePromotionStatus(req: Request, res: Response, next: NextFunction) {
 try {
 const adminUserId = req.user!.userId;
 const promoId = req.params.id as string;
 const promo = await PromotionService.togglePromotionStatus(adminUserId, promoId);
 const statusText = promo.isActive ? 'ACTIVATED' : 'DEACTIVATED';
 return sendSuccess(res, `Promotion ${promo.code} ${statusText} successfully`, promo);
 } catch (error) {
 next(error);
 }
 }
}
