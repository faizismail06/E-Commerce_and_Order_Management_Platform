import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import {
 createCategorySchema,
 updateCategorySchema,
 createProductSchema,
 updateProductSchema,
 productQuerySchema,
} from '../validators/product.validator';
import { sendSuccess } from '../utils/response';

export class ProductController {
 // Categories
 static async getCategories(req: Request, res: Response, next: NextFunction) {
 try {
 const categories = await ProductService.getCategories();
 return sendSuccess(res, 'Categories retrieved successfully', categories);
 } catch (error) {
 next(error);
 }
 }

 static async createCategory(req: Request, res: Response, next: NextFunction) {
 try {
 const validated = createCategorySchema.parse(req.body);
 const category = await ProductService.createCategory(validated);
 return sendSuccess(res, 'Category created successfully', category, 201);
 } catch (error) {
 next(error);
 }
 }

 static async updateCategory(req: Request, res: Response, next: NextFunction) {
 try {
 const id = req.params.id as string;
 const validated = updateCategorySchema.parse(req.body);
 const category = await ProductService.updateCategory(id, validated);
 return sendSuccess(res, 'Category updated successfully', category);
 } catch (error) {
 next(error);
 }
 }

 static async deleteCategory(req: Request, res: Response, next: NextFunction) {
 try {
 const id = req.params.id as string;
 await ProductService.deleteCategory(id);
 return sendSuccess(res, 'Category deleted successfully');
 } catch (error) {
 next(error);
 }
 }

 // Products
 static async getProducts(req: Request, res: Response, next: NextFunction) {
 try {
 const queryParams = productQuerySchema.parse(req.query);
 const result = await ProductService.getProducts(queryParams);
 return sendSuccess(
 res,
 'Products retrieved successfully',
 result.products,
 200,
 result.meta
 );
 } catch (error) {
 next(error);
 }
 }

 static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
 try {
 const slug = req.params.slug as string;
 const product = await ProductService.getProductBySlug(slug);
 return sendSuccess(res, 'Product detail retrieved successfully', product);
 } catch (error) {
 next(error);
 }
 }

 static async createProduct(req: Request, res: Response, next: NextFunction) {
 try {
 const validated = createProductSchema.parse(req.body);
 const product = await ProductService.createProduct(validated);
 return sendSuccess(res, 'Product created successfully', product, 201);
 } catch (error) {
 next(error);
 }
 }

 static async updateProduct(req: Request, res: Response, next: NextFunction) {
 try {
 const id = req.params.id as string;
 const validated = updateProductSchema.parse(req.body);
 const product = await ProductService.updateProduct(id, validated);
 return sendSuccess(res, 'Product updated successfully', product);
 } catch (error) {
 next(error);
 }
 }

 static async deleteProduct(req: Request, res: Response, next: NextFunction) {
 try {
 const id = req.params.id as string;
 await ProductService.deleteProduct(id);
 return sendSuccess(res, 'Product soft-deleted successfully');
 } catch (error) {
 next(error);
 }
 }
}
