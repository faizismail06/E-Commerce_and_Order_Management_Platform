export interface Category {
 id: string;
 name: string;
 slug: string;
 description?: string | null;
 imageUrl?: string | null;
 _count?: {
 products: number;
 };
}

export interface ProductImage {
 id: string;
 url: string;
 isPrimary: boolean;
}

export interface ReviewItem {
 id: string;
 rating: number;
 comment: string;
 createdAt: string;
 user: {
 id: string;
 fullName: string;
 };
}

export interface Product {
 id: string;
 sku: string;
 name: string;
 slug: string;
 description: string;
 price: number | string;
 discountPrice?: number | string | null;
 stock: number;
 reservedStock: number;
 availableStock: number;
 minStock: number;
 weight: number;
 isActive: boolean;
 categoryId: string;
 category: {
 id: string;
 name: string;
 slug: string;
 };
 images: ProductImage[];
 ratingAverage: number;
 totalReviews: number;
 ratingAvg?: number;
 ratingCount?: number;
 reviews?: ReviewItem[];
 createdAt: string;
 updatedAt: string;
}

export interface ProductFilters {
 page?: number;
 limit?: number;
 search?: string;
 category?: string;
 minPrice?: number;
 maxPrice?: number;
 sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
 inStockOnly?: boolean;
}

export interface PaginationMeta {
 page: number;
 limit: number;
 totalItems: number;
 totalPages: number;
}
