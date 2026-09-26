import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateReviewInput } from '../validators/review.validator';

export class ReviewService {
 static async createProductReview(userId: string, productId: string, input: CreateReviewInput) {
 // 1. Verify user purchased this product in the specified order
 const order = await prisma.order.findFirst({
 where: {
 id: input.orderId,
 userId,
 orderStatus: {
 in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED],
 },
 items: {
 some: { productId },
 },
 },
 });

 if (!order) {
 const error: any = new Error(
 'Verified purchase required. You can only review products from paid or completed orders.'
 );
 error.statusCode = 403;
 throw error;
 }

 // 2. Check if already reviewed for this order & product combination
 const existingReview = await prisma.review.findUnique({
 where: {
 userId_orderId_productId: {
 userId,
 orderId: input.orderId,
 productId,
 },
 },
 });

 if (existingReview) {
 const error: any = new Error('You have already submitted a review for this product from this order');
 error.statusCode = 400;
 throw error;
 }

 // 3. Create review & update product rating averages in a transaction
 return await prisma.$transaction(async (tx) => {
 const review = await tx.review.create({
 data: {
 productId,
 userId,
 orderId: input.orderId,
 rating: input.rating,
 comment: input.comment,
 },
 include: {
 user: { select: { fullName: true } },
 },
 });

 // Aggregate new rating statistics for product
 const stats = await tx.review.aggregate({
 where: { productId },
 _avg: { rating: true },
 _count: { rating: true },
 });

 const ratingAvg = Math.round((stats._avg.rating || 0) * 10) / 10;
 const ratingCount = stats._count.rating || 0;

 await tx.product.update({
 where: { id: productId },
 data: {
 ratingAvg,
 ratingCount,
 },
 });

 return { review, ratingAvg, ratingCount };
 });
 }

 static async getProductReviews(productId: string) {
 const product = await prisma.product.findUnique({
 where: { id: productId },
 select: { id: true, ratingAvg: true, ratingCount: true },
 });

 if (!product) {
 const error: any = new Error('Product not found');
 error.statusCode = 404;
 throw error;
 }

 const reviews = await prisma.review.findMany({
 where: { productId },
 orderBy: { createdAt: 'desc' },
 include: {
 user: { select: { fullName: true } },
 },
 });

 // Breakdown distribution (counts of 5, 4, 3, 2, 1 stars)
 const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
 reviews.forEach((r) => {
 if (breakdown[r.rating] !== undefined) {
 breakdown[r.rating]++;
 }
 });

 return {
 summary: {
 ratingAvg: product.ratingAvg,
 totalReviews: product.ratingCount,
 breakdown,
 },
 reviews: reviews.map((r) => ({
 id: r.id,
 rating: r.rating,
 comment: r.comment,
 userName: r.user.fullName,
 createdAt: r.createdAt,
 isVerifiedPurchase: true,
 })),
 };
 }
}
