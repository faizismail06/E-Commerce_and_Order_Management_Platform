import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// All analytics routes require Admin or Super Admin authentication
router.use(authenticateToken);
router.use(requireRoles('ADMIN', 'SUPER_ADMIN'));

router.get('/overview', AnalyticsController.getOverview);
router.get('/top-products', AnalyticsController.getTopProducts);
router.get('/categories', AnalyticsController.getCategoriesDistribution);
router.get('/export', AnalyticsController.exportCSVReport);

export default router;
