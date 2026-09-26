import { z } from 'zod';

export const createCategorySchema = z.object({
 name: z.string().min(2, { message: 'Category name must be at least 2 characters' }),
 description: z.string().optional(),
 imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
 sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }),
 name: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
 description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
 price: z.number().positive({ message: 'Price must be positive' }),
 discountPrice: z.number().nonnegative().optional().nullable(),
 stock: z.number().int().nonnegative({ message: 'Stock cannot be negative' }),
 minStock: z.number().int().nonnegative().optional().default(5),
 weight: z.number().int().positive({ message: 'Weight must be a positive integer in grams' }),
 categoryId: z.string().uuid({ message: 'Invalid Category ID' }),
 isActive: z.boolean().optional().default(true),
 images: z.array(
 z.object({
 url: z.string().url({ message: 'Invalid image URL' }),
 isPrimary: z.boolean().optional().default(false),
 })
 ).min(1, { message: 'At least one product image is required' }),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
 page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
 limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
 search: z.string().optional(),
 category: z.string().optional(),
 minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
 maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
 sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular']).optional().default('newest'),
 inStockOnly: z.string().optional().transform((val) => val === 'true'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
