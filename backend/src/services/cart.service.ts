import { prisma } from '../config/prisma';
import { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator';

export class CartService {
 private static async getOrCreateCart(userId: string) {
 let cart = await prisma.cart.findUnique({
 where: { userId },
 });

 if (!cart) {
 cart = await prisma.cart.create({
 data: { userId },
 });
 }
 return cart;
 }

 static async getCart(userId: string) {
 const cart = await this.getOrCreateCart(userId);

 const fullCart = await prisma.cart.findUnique({
 where: { id: cart.id },
 include: {
 items: {
 include: {
 product: {
 include: {
 category: { select: { id: true, name: true, slug: true } },
 images: { select: { id: true, url: true, isPrimary: true } },
 },
 },
 },
 orderBy: { createdAt: 'asc' },
 },
 },
 });

 if (!fullCart) return null;

 let subtotal = 0;
 let totalWeight = 0;

 const formattedItems = fullCart.items.map((item) => {
 const p = item.product;
 const priceNum = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price);
 const discountNum = p.discountPrice
 ? typeof p.discountPrice === 'string'
 ? parseFloat(p.discountPrice)
 : Number(p.discountPrice)
 : null;

 const effectivePrice = discountNum !== null && discountNum < priceNum ? discountNum : priceNum;
 const itemSubtotal = effectivePrice * item.quantity;

 subtotal += itemSubtotal;
 totalWeight += p.weight * item.quantity;

 const availableStock = p.stock - p.reservedStock;
 const isStockSufficient = availableStock >= item.quantity;

 return {
 id: item.id,
 productId: p.id,
 name: p.name,
 slug: p.slug,
 sku: p.sku,
 unitPrice: priceNum,
 effectivePrice,
 quantity: item.quantity,
 subtotal: itemSubtotal,
 weight: p.weight,
 availableStock,
 isStockSufficient,
 image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || '',
 category: p.category.name,
 };
 });

 // Calculate Estimated Shipping Fee: Rp 10.000 per 1000g (Min Rp 10.000 if weight > 0)
 const weightKg = Math.ceil(totalWeight / 1000);
 const estimatedShippingCost = formattedItems.length > 0 ? Math.max(1, weightKg) * 10000 : 0;
 const discountAmount = 0; // Promo system integrated in Phase 7
 const grandTotal = subtotal - discountAmount + estimatedShippingCost;

 return {
 id: fullCart.id,
 items: formattedItems,
 totalItems: formattedItems.reduce((acc, i) => acc + i.quantity, 0),
 totalWeight, // in grams
 subtotal,
 discountAmount,
 estimatedShippingCost,
 grandTotal,
 };
 }

 static async addToCart(userId: string, input: AddToCartInput) {
 const cart = await this.getOrCreateCart(userId);

 const product = await prisma.product.findUnique({
 where: { id: input.productId },
 });

 if (!product || !product.isActive) {
 const error: any = new Error('Product not found or inactive');
 error.statusCode = 404;
 throw error;
 }

 const availableStock = product.stock - product.reservedStock;

 // Check existing item in cart
 const existingItem = await prisma.cartItem.findUnique({
 where: {
 cartId_productId: {
 cartId: cart.id,
 productId: input.productId,
 },
 },
 });

 const newQuantity = (existingItem?.quantity || 0) + input.quantity;

 if (availableStock < newQuantity) {
 const error: any = new Error(
 `Cannot add to cart. Only ${availableStock} units available for product ${product.name}.`
 );
 error.statusCode = 400;
 error.code = 'INSUFFICIENT_STOCK';
 throw error;
 }

 if (existingItem) {
 await prisma.cartItem.update({
 where: { id: existingItem.id },
 data: { quantity: newQuantity },
 });
 } else {
 await prisma.cartItem.create({
 data: {
 cartId: cart.id,
 productId: input.productId,
 quantity: input.quantity,
 },
 });
 }

 return await this.getCart(userId);
 }

 static async updateCartItem(userId: string, cartItemId: string, input: UpdateCartItemInput) {
 const cart = await this.getOrCreateCart(userId);

 const cartItem = await prisma.cartItem.findFirst({
 where: { id: cartItemId, cartId: cart.id },
 include: { product: true },
 });

 if (!cartItem) {
 const error: any = new Error('Cart item not found');
 error.statusCode = 404;
 throw error;
 }

 const availableStock = cartItem.product.stock - cartItem.product.reservedStock;
 if (availableStock < input.quantity) {
 const error: any = new Error(
 `Cannot set quantity to ${input.quantity}. Only ${availableStock} units available.`
 );
 error.statusCode = 400;
 error.code = 'INSUFFICIENT_STOCK';
 throw error;
 }

 await prisma.cartItem.update({
 where: { id: cartItemId },
 data: { quantity: input.quantity },
 });

 return await this.getCart(userId);
 }

 static async removeCartItem(userId: string, cartItemId: string) {
 const cart = await this.getOrCreateCart(userId);

 const cartItem = await prisma.cartItem.findFirst({
 where: { id: cartItemId, cartId: cart.id },
 });

 if (!cartItem) {
 const error: any = new Error('Cart item not found');
 error.statusCode = 404;
 throw error;
 }

 await prisma.cartItem.delete({
 where: { id: cartItemId },
 });

 return await this.getCart(userId);
 }

 static async clearCart(userId: string) {
 const cart = await this.getOrCreateCart(userId);
 await prisma.cartItem.deleteMany({
 where: { cartId: cart.id },
 });
 return await this.getCart(userId);
 }
}
