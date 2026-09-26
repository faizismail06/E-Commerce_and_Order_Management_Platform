import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', AddressController.getAddresses);
router.post('/', AddressController.createAddress);
router.put('/:id', AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);
router.put('/:id/default', AddressController.setDefaultAddress);

export default router;
