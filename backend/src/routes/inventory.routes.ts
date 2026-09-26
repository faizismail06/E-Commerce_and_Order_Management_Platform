import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, requireRoles('ADMIN', 'SUPER_ADMIN'));

router.get('/', InventoryController.getInventory);
router.post('/adjust', InventoryController.adjustStock);
router.get('/movements', InventoryController.getMovements);
router.post('/expire-scan', InventoryController.triggerExpiredScan);

export default router;
