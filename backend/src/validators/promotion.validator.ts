import { z } from 'zod';
import { PromoType } from '@prisma/client';

export const applyCouponSchema = z.object({
 code: z.string().min(1, 'Coupon code is required').transform((val) => val.toUpperCase().trim()),
 subtotal: z.number().min(0, 'Cart subtotal must be non-negative'),
});

export const createPromotionSchema = z.object({
 code: z.string().min(3, 'Code must be at least 3 characters').transform((val) => val.toUpperCase().trim()),
 name: z.string().min(3, 'Name must be at least 3 characters'),
 type: z.nativeEnum(PromoType),
 value: z.number().positive('Discount value must be positive'),
 minPurchase: z.number().min(0).default(0),
 maxDiscount: z.number().positive().nullable().optional(),
 usageLimit: z.number().int().positive().default(100),
 startDate: z.string().or(z.date()).transform((val) => new Date(val)),
 endDate: z.string().or(z.date()).transform((val) => new Date(val)),
 isActive: z.boolean().default(true),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
