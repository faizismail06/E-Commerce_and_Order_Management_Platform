import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { createReviewSchema } from '../validators/review.validator';
import { sendSuccess } from '../utils/response';

export class ReviewController {
 static async createReview(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const productId = req.params.productId as string;
 const validated = createReviewSchema.parse(req.body);

 const result = await ReviewService.createProductReview(userId, productId, validated);
 return sendSuccess(res, 'Thank you! Your verified product review has been submitted.', result, 201);
 } catch (error) {
 next(error);
 }
 }

 static async getProductReviews(req: Request, res: Response, next: NextFunction) {
 try {
 const productId = req.params.productId as string;
 const data = await ReviewService.getProductReviews(productId);
 return sendSuccess(res, 'Product reviews retrieved successfully', data);
 } catch (error) {
 next(error);
 }
 }
}
