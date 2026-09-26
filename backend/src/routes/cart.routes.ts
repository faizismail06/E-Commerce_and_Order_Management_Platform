import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.put('/items/:id', CartController.updateCartItem);
router.delete('/items/:id', CartController.removeCartItem);
router.delete('/', CartController.clearCart);

export default router;
