import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// Public product reviews
router.get('/products/:productId/reviews', ReviewController.getProductReviews);

// Protected review submission (Requires authentication and verified purchase check)
router.post('/products/:productId/reviews', authenticateToken, ReviewController.createReview);

export default router;
