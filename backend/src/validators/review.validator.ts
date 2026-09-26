import { z } from 'zod';

export const createReviewSchema = z.object({
 orderId: z.string().uuid('Invalid order ID'),
 rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating maximum is 5 stars'),
 comment: z.string().min(3, 'Review comment must be at least 3 characters long'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
