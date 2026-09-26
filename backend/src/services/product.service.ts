import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import {
 CreateCategoryInput,
 UpdateCategoryInput,
 CreateProductInput,
 UpdateProductInput,
 ProductQueryParams,
} from '../validators/product.validator';

function slugify(text: string): string {
 return text
 .toString()
 .toLowerCase()
 .trim()
 .replace(/\s+/g, '-')
 .replace(/[^\w\-]+/g, '')
 .replace(/\-\-+/g, '-');
}

export class ProductService {
 // Category Operations
 static async getCategories() {
 return await prisma.category.findMany({
 orderBy: { name: 'asc' },
 include: {
 _count: {
 select: { products: true },
 },
 },
 });
 }

 static async createCategory(input: CreateCategoryInput) {
 const slug = slugify(input.name);
 const existing = await prisma.category.findFirst({
 where: { OR: [{ name: input.name }, { slug }] },
 });

 if (existing) {
 const error: any = new Error('Category name or slug already exists');
 error.statusCode = 400;
 throw error;
 }

 return await prisma.category.create({
 data: {
 name: input.name,
 slug,
 description: input.description,
 imageUrl: input.imageUrl,
 },
 });
 }

 static async updateCategory(id: string, input: UpdateCategoryInput) {
 const dataToUpdate: any = { ...input };
 if (input.name) {
 dataToUpdate.slug = slugify(input.name);
 }

 return await prisma.category.update({
 where: { id },
 data: dataToUpdate,
 });
 }

 static async deleteCategory(id: string) {
 const productsCount = await prisma.product.count({
 where: { categoryId: id },
 });

 if (productsCount > 0) {
 const error: any = new Error(
 `Cannot delete category. There are ${productsCount} products assigned to it.`
 );
 error.statusCode = 400;
 throw error;
 }

 return await prisma.category.delete({
 where: { id },
 });
 }

 // Product Operations
 static async getProducts(params: ProductQueryParams) {
 const page = Math.max(1, params.page || 1);
 const limit = Math.max(1, Math.min(100, params.limit || 12));
 const skip = (page - 1) * limit;

 const where: Prisma.ProductWhereInput = {
 isActive: true,
 };

 if (params.search) {
 where.OR = [
 { name: { contains: params.search, mode: 'insensitive' } },
 { description: { contains: params.search, mode: 'insensitive' } },
 { sku: { contains: params.search, mode: 'insensitive' } },
 ];
 }

 if (params.category) {
 where.category = {
 slug: params.category,
 };
 }

 if (params.minPrice !== undefined || params.maxPrice !== undefined) {
 where.price = {};
 if (params.minPrice !== undefined) where.price.gte = params.minPrice;
 if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
 }

 if (params.inStockOnly) {
 where.stock = { gt: 0 };
 }

 let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

 if (params.sortBy === 'price_asc') {
 orderBy = { price: 'asc' };
 } else if (params.sortBy === 'price_desc') {
 orderBy = { price: 'desc' };
 }

 const [products, totalItems] = await Promise.all([
 prisma.product.findMany({
 where,
 skip,
 take: limit,
 orderBy,
 include: {
 category: {
 select: { id: true, name: true, slug: true },
 },
 images: {
 select: { id: true, url: true, isPrimary: true },
 },
 reviews: {
 select: { rating: true },
 },
 },
 }),
 prisma.product.count({ where }),
 ]);

 const formattedProducts = products.map((p) => {
 const totalReviews = p.reviews.length;
 const avgRating =
 totalReviews > 0
 ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
 : 0;

 const { reviews, ...rest } = p;
 return {
 ...rest,
 availableStock: p.stock - p.reservedStock,
 ratingAverage: Math.round(avgRating * 10) / 10,
 totalReviews,
 };
 });

 return {
 products: formattedProducts,
 meta: {
 page,
 limit,
 totalItems,
 totalPages: Math.ceil(totalItems / limit),
 },
 };
 }

 static async getProductBySlug(slug: string) {
 const product = await prisma.product.findUnique({
 where: { slug },
 include: {
 category: true,
 images: true,
 reviews: {
 include: {
 user: {
 select: { id: true, fullName: true },
 },
 },
 orderBy: { createdAt: 'desc' },
 },
 },
 });

 if (!product || !product.isActive) {
 const error: any = new Error('Product not found or inactive');
 error.statusCode = 404;
 throw error;
 }

 const totalReviews = product.reviews.length;
 const avgRating =
 totalReviews > 0
 ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
 : 0;

 return {
 ...product,
 availableStock: product.stock - product.reservedStock,
 ratingAverage: Math.round(avgRating * 10) / 10,
 totalReviews,
 };
 }

 static async createProduct(input: CreateProductInput) {
 const slug = slugify(input.name);

 const existingSku = await prisma.product.findUnique({
 where: { sku: input.sku },
 });
 if (existingSku) {
 const error: any = new Error(`Product with SKU '${input.sku}' already exists`);
 error.statusCode = 400;
 throw error;
 }

 return await prisma.product.create({
 data: {
 sku: input.sku,
 name: input.name,
 slug,
 description: input.description,
 price: input.price,
 discountPrice: input.discountPrice || null,
 stock: input.stock,
 minStock: input.minStock || 5,
 weight: input.weight,
 categoryId: input.categoryId,
 isActive: input.isActive ?? true,
 images: {
 create: input.images.map((img) => ({
 url: img.url,
 isPrimary: img.isPrimary,
 })),
 },
 },
 include: {
 category: true,
 images: true,
 },
 });
 }

 static async updateProduct(id: string, input: UpdateProductInput) {
 const dataToUpdate: any = { ...input };

 if (input.name) {
 dataToUpdate.slug = slugify(input.name);
 }

 delete dataToUpdate.images;

 if (input.images) {
 await prisma.productImage.deleteMany({
 where: { productId: id },
 });
 dataToUpdate.images = {
 create: input.images.map((img) => ({
 url: img.url,
 isPrimary: img.isPrimary,
 })),
 };
 }

 return await prisma.product.update({
 where: { id },
 data: dataToUpdate,
 include: {
 category: true,
 images: true,
 },
 });
 }

 static async deleteProduct(id: string) {
 // Soft delete
 return await prisma.product.update({
 where: { id },
 data: { isActive: false },
 });
 }
}
