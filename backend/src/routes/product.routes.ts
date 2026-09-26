import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public Routes
router.get('/categories', ProductController.getCategories);
router.get('/products', ProductController.getProducts);
router.get('/products/:slug', ProductController.getProductBySlug);

// Protected Admin Routes
router.post(
 '/admin/categories',
 authenticateToken,
 requireRoles('ADMIN', 'SUPER_ADMIN'),
 ProductController.createCategory
);
router.put(
 '/admin/categories/:id',
 authenticateToken,
 requireRoles('ADMIN', 'SUPER_ADMIN'),
 ProductController.updateCategory
);
router.delete(
 '/admin/categories/:id',
 authenticateToken,
 requireRoles('ADMIN', 'SUPER_ADMIN'),
 ProductController.deleteCategory
);

router.post(
 '/admin/products',
 authenticateToken,
 requireRoles('ADMIN', 'SUPER_ADMIN'),
 ProductController.createProduct
);
router.put(
 '/admin/products/:id',
 authenticateToken,
 requireRoles('ADMIN', 'SUPER_ADMIN'),
 ProductController.updateProduct
);
router.delete(
 '/admin/products/:id',
 authenticateToken,
 requireRoles('ADMIN', 'SUPER_ADMIN'),
 ProductController.deleteProduct
);

export default router;
