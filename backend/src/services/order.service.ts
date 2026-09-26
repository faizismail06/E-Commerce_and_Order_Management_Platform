import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { snap, verifyMidtransSignature } from '../integrations/midtrans';
import { ENV } from '../config/env';
import { CreateOrderInput } from '../validators/order.validator';
import { CartService } from './cart.service';

export class OrderService {
 private static async generateOrderNumber(): Promise<string> {
 const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
 const prefix = `ORD-${todayStr}-`;

 const lastOrder = await prisma.order.findFirst({
 where: {
 orderNumber: {
 startsWith: prefix,
 },
 },
 orderBy: { orderNumber: 'desc' },
 });

 let sequence = 1;
 if (lastOrder) {
 const parts = lastOrder.orderNumber.split('-');
 if (parts.length === 3) {
 sequence = parseInt(parts[2], 10) + 1;
 }
 }

 const paddedSeq = sequence.toString().padStart(6, '0');
 return `${prefix}${paddedSeq}`;
 }

 static async createOrder(userId: string, input: CreateOrderInput) {
 const cart = await CartService.getCart(userId);
 if (!cart || cart.items.length === 0) {
 const error: any = new Error('Shopping cart is empty');
 error.statusCode = 400;
 throw error;
 }

 // Verify Address belongs to user
 const address = await prisma.address.findFirst({
 where: { id: input.addressId, userId },
 });
 if (!address) {
 const error: any = new Error('Delivery address not found');
 error.statusCode = 404;
 throw error;
 }

 // Validate stock for all items
 for (const item of cart.items) {
 if (!item.isStockSufficient) {
 const error: any = new Error(
 `Product ${item.name} has only ${item.availableStock} units remaining.`
 );
 error.statusCode = 400;
 error.code = 'INSUFFICIENT_STOCK';
 throw error;
 }
 }

 const orderNumber = await this.generateOrderNumber();
 const user = await prisma.user.findUnique({ where: { id: userId } });

 // Validate Coupon if supplied
 let appliedPromotionId: string | undefined;
 let computedDiscount = 0;

 if (input.couponCode) {
 const { PromotionService } = await import('./promotion.service');
 const promoResult = await PromotionService.validateAndApplyCoupon(
 input.couponCode,
 cart.subtotal
 );
 appliedPromotionId = promoResult.promotionId;
 computedDiscount = promoResult.discountAmount;
 }

 const finalSubtotalAfterDiscount = Math.max(0, cart.subtotal - computedDiscount);
 const finalGrandTotal = finalSubtotalAfterDiscount + cart.estimatedShippingCost;

 // Execute Transactional Order Creation & Stock Reservation
 const newOrder = await prisma.$transaction(async (tx) => {
 // 1. Reserve Stock for each item
 for (const item of cart.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: {
 reservedStock: { increment: item.quantity },
 },
 });
 }

 // 2. Increment Coupon Used Count if applied
 if (appliedPromotionId) {
 await tx.promotion.update({
 where: { id: appliedPromotionId },
 data: { usedCount: { increment: 1 } },
 });
 }

 // 3. Create Order
 const createdOrder = await tx.order.create({
 data: {
 orderNumber,
 userId,
 addressId: address.id,
 subtotal: cart.subtotal,
 discountAmount: computedDiscount,
 shippingCost: cart.estimatedShippingCost,
 grandTotal: finalGrandTotal,
 promotionId: appliedPromotionId,
 orderStatus: OrderStatus.PENDING_PAYMENT,
 paymentStatus: PaymentStatus.PENDING,
 courier: input.courier || 'JNE',
 courierService: input.courierService || 'REG',
 items: {
 create: cart.items.map((i) => ({
 productId: i.productId,
 name: i.name,
 price: i.effectivePrice,
 quantity: i.quantity,
 subtotal: i.subtotal,
 })),
 },
 },
 include: {
 items: true,
 address: true,
 },
 });

 // 4. Clear Cart Items
 await tx.cartItem.deleteMany({
 where: { cart: { userId } },
 });

 return createdOrder;
 });

 // 4. Create Midtrans Transaction Token
 let snapToken = '';
 let snapRedirectUrl = '';

 try {
 const itemDetails: any[] = newOrder.items.map((item) => ({
 id: item.productId,
 price: Math.round(Number(item.price)),
 quantity: item.quantity,
 name: item.name.slice(0, 50),
 }));

 itemDetails.push({
 id: 'SHIPPING-FEE',
 price: Math.round(Number(newOrder.shippingCost)),
 quantity: 1,
 name: 'Courier Shipping Fee',
 });

 if (Number(newOrder.discountAmount) > 0) {
 itemDetails.push({
 id: 'DISCOUNT',
 price: -Math.round(Number(newOrder.discountAmount)),
 quantity: 1,
 name: 'Promo Discount',
 });
 }

 const grossAmount = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

 const parameter = {
 transaction_details: {
 order_id: newOrder.orderNumber,
 gross_amount: grossAmount,
 },
 item_details: itemDetails,
 customer_details: {
 first_name: user?.fullName || 'Customer',
 email: user?.email,
 phone: address.phone,
 shipping_address: {
 first_name: address.recipientName,
 phone: address.phone,
 address: address.fullAddress,
 city: address.city,
 postal_code: address.postalCode,
 country_code: 'IDN',
 },
 },
 };

 console.log(' Requesting Midtrans Snap Token with Parameter:', JSON.stringify(parameter));
 const transaction = await snap.createTransaction(parameter);
 snapToken = transaction.token;
 snapRedirectUrl = transaction.redirect_url;
 console.log('[x] Midtrans Snap Token Generated Successfully:', snapToken);
 } catch (err: any) {
 console.error('Warning: Midtrans Snap Token Generation Error:', err?.ApiResponse || err?.message || err);
 const apiErrMsg = err?.ApiResponse?.error_messages?.join(', ') || err?.message || 'Unauthorized / Access Denied';
 const error: any = new Error(`Midtrans Payment Gateway Error: ${apiErrMsg}`);
 error.statusCode = 400;
 throw error;
 }

 // 5. Store Payment Record
 const payment = await prisma.payment.create({
 data: {
 orderId: newOrder.id,
 snapToken,
 snapRedirectUrl,
 status: PaymentStatus.PENDING,
 },
 });

 return {
 order: newOrder,
 payment,
 snapToken,
 };
 }

 static async getOrders(userId: string) {
 return await prisma.order.findMany({
 where: { userId },
 orderBy: { createdAt: 'desc' },
 include: {
 items: true,
 address: true,
 payment: {
 select: { snapToken: true, snapRedirectUrl: true, status: true, paidAt: true },
 },
 },
 });
 }

 static async getOrderById(orderId: string, userId?: string) {
 const where: any = { id: orderId };
 if (userId) where.userId = userId;

 const order = await prisma.order.findFirst({
 where,
 include: {
 items: {
 include: {
 product: {
 select: { id: true, slug: true, images: { select: { url: true, isPrimary: true } } },
 },
 },
 },
 address: true,
 payment: true,
 user: { select: { id: true, fullName: true, email: true, phone: true } },
 },
 });

 if (!order) {
 const error: any = new Error('Order not found');
 error.statusCode = 404;
 throw error;
 }

 return order;
 }

 static async cancelOrder(userId: string, orderId: string) {
 const order = await prisma.order.findFirst({
 where: { id: orderId, userId },
 include: { items: true },
 });

 if (!order) {
 const error: any = new Error('Order not found');
 error.statusCode = 404;
 throw error;
 }

 if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) {
 const error: any = new Error('Only pending payment orders can be cancelled');
 error.statusCode = 400;
 throw error;
 }

 return await prisma.$transaction(async (tx) => {
 // 1. Release reserved stock
 for (const item of order.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: {
 reservedStock: { decrement: item.quantity },
 },
 });
 }

 // 2. Update Order status to CANCELLED
 const updatedOrder = await tx.order.update({
 where: { id: orderId },
 data: {
 orderStatus: OrderStatus.CANCELLED,
 paymentStatus: PaymentStatus.FAILED,
 },
 });

 // 3. Update Payment record
 await tx.payment.update({
 where: { orderId: order.id },
 data: { status: PaymentStatus.FAILED },
 });

 return updatedOrder;
 });
 }

 static async handleMidtransWebhook(payload: any) {
 const {
 order_id,
 status_code,
 gross_amount,
 signature_key,
 transaction_status,
 fraud_status,
 payment_type,
 transaction_id,
 } = payload;

 // 1. Verify Signature
 const isValidSignature = verifyMidtransSignature(
 order_id,
 status_code,
 gross_amount,
 ENV.MIDTRANS_SERVER_KEY,
 signature_key
 );

 if (!isValidSignature) {
 const error: any = new Error('Invalid Midtrans HMAC SHA-512 signature key');
 error.statusCode = 400;
 throw error;
 }

 // 2. Find Order by orderNumber
 const order = await prisma.order.findUnique({
 where: { orderNumber: order_id },
 include: { items: true },
 });

 if (!order) {
 const error: any = new Error(`Order ${order_id} not found`);
 error.statusCode = 404;
 throw error;
 }

 // If already processed, return early
 if (order.orderStatus === OrderStatus.PAID || order.orderStatus === OrderStatus.COMPLETED) {
 return { message: 'Order already processed' };
 }

 // 3. Determine Payment Status Mapping
 let isSuccess = false;
 let isFailed = false;

 if (transaction_status === 'capture' || transaction_status === 'settlement') {
 if (fraud_status === 'accept' || !fraud_status) {
 isSuccess = true;
 }
 } else if (
 transaction_status === 'cancel' ||
 transaction_status === 'deny' ||
 transaction_status === 'expire'
 ) {
 isFailed = true;
 }

 // 4. Database Transaction for Status Update & Stock Deduct/Release
 return await prisma.$transaction(async (tx) => {
 if (isSuccess) {
 // Deduct actual stock and release reserved stock
 for (const item of order.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: {
 stock: { decrement: item.quantity },
 reservedStock: { decrement: item.quantity },
 },
 });
 }

 await tx.order.update({
 where: { id: order.id },
 data: {
 orderStatus: OrderStatus.PAID,
 paymentStatus: PaymentStatus.PAID,
 },
 });

 await tx.payment.update({
 where: { orderId: order.id },
 data: {
 status: PaymentStatus.PAID,
 paymentType: payment_type,
 transactionId: transaction_id,
 transactionStatus: transaction_status,
 fraudStatus: fraud_status,
 rawWebhookPayload: payload,
 paidAt: new Date(),
 },
 });

 return { message: 'Payment confirmed & order updated to PAID' };
 } else if (isFailed) {
 // Release reserved stock back to pool
 for (const item of order.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: {
 reservedStock: { decrement: item.quantity },
 },
 });
 }

 const newOrderStatus =
 transaction_status === 'expire' ? OrderStatus.EXPIRED : OrderStatus.CANCELLED;
 const newPaymentStatus =
 transaction_status === 'expire' ? PaymentStatus.EXPIRED : PaymentStatus.FAILED;

 await tx.order.update({
 where: { id: order.id },
 data: {
 orderStatus: newOrderStatus,
 paymentStatus: newPaymentStatus,
 },
 });

 await tx.payment.update({
 where: { orderId: order.id },
 data: {
 status: newPaymentStatus,
 paymentType: payment_type,
 transactionId: transaction_id,
 transactionStatus: transaction_status,
 rawWebhookPayload: payload,
 },
 });

 return { message: `Order status updated to ${newOrderStatus}` };
 }

 return { message: 'Payment status pending' };
 });
 }
}

