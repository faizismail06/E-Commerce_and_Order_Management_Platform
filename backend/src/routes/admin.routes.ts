import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Protect all admin endpoints
router.use(authenticateToken);
router.use(requireRoles('ADMIN', 'SUPER_ADMIN'));

// Metrics
router.get('/metrics', AdminController.getDashboardMetrics);

// Orders Management
router.get('/orders', AdminController.getOrders);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);
router.post('/orders/:id/ship', AdminController.shipOrder);

// Customer Accounts Management
router.get('/customers', AdminController.getCustomers);
router.patch('/customers/:id/status', AdminController.toggleCustomerStatus);

export default router;
