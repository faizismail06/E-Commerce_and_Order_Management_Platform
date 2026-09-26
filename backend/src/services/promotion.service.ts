import { PromoType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreatePromotionInput } from '../validators/promotion.validator';

export class PromotionService {
 static async validateAndApplyCoupon(code: string, subtotal: number) {
 const promotion = await prisma.promotion.findUnique({
 where: { code: code.toUpperCase().trim() },
 });

 if (!promotion) {
 const error: any = new Error(`Promo code "${code}" is invalid`);
 error.statusCode = 404;
 throw error;
 }

 if (!promotion.isActive) {
 const error: any = new Error(`Promo code "${code}" is no longer active`);
 error.statusCode = 400;
 throw error;
 }

 const now = new Date();
 if (now < promotion.startDate || now > promotion.endDate) {
 const error: any = new Error(`Promo code "${code}" is expired or not yet valid`);
 error.statusCode = 400;
 throw error;
 }

 if (promotion.usedCount >= promotion.usageLimit) {
 const error: any = new Error(`Promo code "${code}" has reached maximum usage limit`);
 error.statusCode = 400;
 throw error;
 }

 const minPurchase = Number(promotion.minPurchase);
 if (subtotal < minPurchase) {
 const error: any = new Error(
 `Minimum purchase of Rp ${minPurchase.toLocaleString('id-ID')} required for this coupon`
 );
 error.statusCode = 400;
 throw error;
 }

 let discountAmount = 0;
 const promoValue = Number(promotion.value);

 if (promotion.type === PromoType.PERCENTAGE) {
 discountAmount = (subtotal * promoValue) / 100;
 if (promotion.maxDiscount) {
 const maxDisc = Number(promotion.maxDiscount);
 discountAmount = Math.min(discountAmount, maxDisc);
 }
 } else if (promotion.type === PromoType.FIXED_AMOUNT) {
 discountAmount = Math.min(promoValue, subtotal);
 }

 discountAmount = Math.round(discountAmount);
 const finalSubtotal = Math.max(0, subtotal - discountAmount);

 return {
 promotionId: promotion.id,
 code: promotion.code,
 name: promotion.name,
 type: promotion.type,
 value: promoValue,
 discountAmount,
 finalSubtotal,
 };
 }

 // Admin Operations
 static async getPromotions() {
 return await prisma.promotion.findMany({
 orderBy: { createdAt: 'desc' },
 });
 }

 static async createPromotion(adminUserId: string, input: CreatePromotionInput) {
 const existing = await prisma.promotion.findUnique({
 where: { code: input.code },
 });

 if (existing) {
 const error: any = new Error(`Promotion code "${input.code}" already exists`);
 error.statusCode = 400;
 throw error;
 }

 return await prisma.$transaction(async (tx) => {
 const created = await tx.promotion.create({
 data: {
 code: input.code,
 name: input.name,
 type: input.type,
 value: input.value,
 minPurchase: input.minPurchase,
 maxDiscount: input.maxDiscount,
 usageLimit: input.usageLimit,
 startDate: input.startDate,
 endDate: input.endDate,
 isActive: input.isActive,
 },
 });

 await tx.auditLog.create({
 data: {
 userId: adminUserId,
 action: 'CREATE_PROMOTION',
 module: 'PROMOTION',
 recordId: created.id,
 metadata: { code: input.code, type: input.type, value: input.value },
 },
 });

 return created;
 });
 }

 static async togglePromotionStatus(adminUserId: string, promoId: string) {
 const promo = await prisma.promotion.findUnique({
 where: { id: promoId },
 });

 if (!promo) {
 const error: any = new Error('Promotion not found');
 error.statusCode = 404;
 throw error;
 }

 const newStatus = !promo.isActive;

 return await prisma.$transaction(async (tx) => {
 const updated = await tx.promotion.update({
 where: { id: promoId },
 data: { isActive: newStatus },
 });

 await tx.auditLog.create({
 data: {
 userId: adminUserId,
 action: newStatus ? 'ACTIVATE_PROMOTION' : 'DEACTIVATE_PROMOTION',
 module: 'PROMOTION',
 recordId: promoId,
 metadata: { code: promo.code, previousStatus: promo.isActive, newStatus },
 },
 });

 return updated;
 });
 }
}
