import { api } from './axios';

export interface AppliedCouponResult {
 promotionId: string;
 code: string;
 name: string;
 type: 'PERCENTAGE' | 'FIXED_AMOUNT';
 value: number;
 discountAmount: number;
 finalSubtotal: number;
}

export interface PromotionAdmin {
 id: string;
 code: string;
 name: string;
 type: 'PERCENTAGE' | 'FIXED_AMOUNT';
 value: number;
 minPurchase: number;
 maxDiscount: number | null;
 usageLimit: number;
 usedCount: number;
 startDate: string;
 endDate: string;
 isActive: boolean;
 createdAt: string;
}

export const applyCoupon = async (
 code: string,
 subtotal: number
): Promise<AppliedCouponResult> => {
 const response = await api.post('/promotions/apply', { code, subtotal });
 return response.data.data;
};

export const fetchAdminPromotions = async (): Promise<PromotionAdmin[]> => {
 const response = await api.get('/promotions/admin/promotions');
 return response.data.data;
};

export const createPromotion = async (data: Partial<PromotionAdmin>): Promise<PromotionAdmin> => {
 const response = await api.post('/promotions/admin/promotions', data);
 return response.data.data;
};

export const togglePromotionStatus = async (promoId: string): Promise<PromotionAdmin> => {
 const response = await api.patch(`/promotions/admin/promotions/${promoId}/status`);
 return response.data.data;
};
