import { api } from './axios';

export interface ProductReview {
 id: string;
 rating: number;
 comment: string;
 userName: string;
 createdAt: string;
 isVerifiedPurchase: boolean;
}

export interface ReviewSummary {
 ratingAvg: number;
 totalReviews: number;
 breakdown: Record<number, number>;
}

export interface ProductReviewsResponse {
 summary: ReviewSummary;
 reviews: ProductReview[];
}

export interface SubmitReviewPayload {
 orderId: string;
 rating: number;
 comment: string;
}

export const fetchProductReviews = async (productId: string): Promise<ProductReviewsResponse> => {
 const response = await api.get(`/products/${productId}/reviews`);
 return response.data.data;
};

export const submitProductReview = async (
 productId: string,
 payload: SubmitReviewPayload
) => {
 const response = await api.post(`/products/${productId}/reviews`, payload);
 return response.data.data;
};
