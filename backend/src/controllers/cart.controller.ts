import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator';
import { sendSuccess } from '../utils/response';

export class CartController {
 static async getCart(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const cart = await CartService.getCart(userId);
 return sendSuccess(res, 'Cart retrieved successfully', cart);
 } catch (error) {
 next(error);
 }
 }

 static async addToCart(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const validated = addToCartSchema.parse(req.body);
 const cart = await CartService.addToCart(userId, validated);
 return sendSuccess(res, 'Product added to cart successfully', cart, 200);
 } catch (error) {
 next(error);
 }
 }

 static async updateCartItem(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const validated = updateCartItemSchema.parse(req.body);
 const cart = await CartService.updateCartItem(userId, id, validated);
 return sendSuccess(res, 'Cart item quantity updated successfully', cart);
 } catch (error) {
 next(error);
 }
 }

 static async removeCartItem(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const cart = await CartService.removeCartItem(userId, id);
 return sendSuccess(res, 'Item removed from cart', cart);
 } catch (error) {
 next(error);
 }
 }

 static async clearCart(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const cart = await CartService.clearCart(userId);
 return sendSuccess(res, 'Cart cleared successfully', cart);
 } catch (error) {
 next(error);
 }
 }
}
