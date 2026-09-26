import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public / Customer coupon verification
router.post('/apply', PromotionController.applyCoupon);

// Admin Promo Code Management
router.get('/admin/promotions', authenticateToken, requireRoles('ADMIN', 'SUPER_ADMIN'), PromotionController.getPromotions);
router.post('/admin/promotions', authenticateToken, requireRoles('ADMIN', 'SUPER_ADMIN'), PromotionController.createPromotion);
router.patch('/admin/promotions/:id/status', authenticateToken, requireRoles('ADMIN', 'SUPER_ADMIN'), PromotionController.togglePromotionStatus);

export default router;
