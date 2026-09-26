import { api } from './axios';
import { Product, Category, ProductFilters, PaginationMeta } from '../types/product';

export const fetchCategories = async (): Promise<Category[]> => {
 const response = await api.get('/categories');
 return response.data?.data || [];
};

export const fetchProducts = async (
 filters: ProductFilters = {}
): Promise<{ products: Product[]; meta: PaginationMeta }> => {
 const params: Record<string, any> = {};
 if (filters.page) params.page = filters.page;
 if (filters.limit) params.limit = filters.limit;
 if (filters.search) params.search = filters.search;
 if (filters.category) params.category = filters.category;
 if (filters.minPrice) params.minPrice = filters.minPrice;
 if (filters.maxPrice) params.maxPrice = filters.maxPrice;
 if (filters.sortBy) params.sortBy = filters.sortBy;
 if (filters.inStockOnly) params.inStockOnly = true;

 const response = await api.get('/products', { params });
 return {
 products: response.data?.data || [],
 meta: response.data?.meta || { page: 1, limit: 12, totalItems: 0, totalPages: 1 },
 };
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
 const response = await api.get(`/products/${slug}`);
 return response.data?.data;
};

export const createAdminProduct = async (productData: any): Promise<Product> => {
 const response = await api.post('/admin/products', productData);
 return response.data?.data;
};

export const updateAdminProduct = async (id: string, productData: any): Promise<Product> => {
 const response = await api.put(`/admin/products/${id}`, productData);
 return response.data?.data;
};

export const deleteAdminProduct = async (id: string): Promise<void> => {
 await api.delete(`/admin/products/${id}`);
};
