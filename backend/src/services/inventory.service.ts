import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AdjustStockInput, InventoryQueryParams } from '../validators/inventory.validator';

export class InventoryService {
 static async getInventory(params: InventoryQueryParams) {
 const page = Math.max(1, params.page || 1);
 const limit = Math.max(1, Math.min(100, params.limit || 20));
 const skip = (page - 1) * limit;

 const where: Prisma.ProductWhereInput = {
 isActive: true,
 };

 if (params.search) {
 where.OR = [
 { name: { contains: params.search, mode: 'insensitive' } },
 { sku: { contains: params.search, mode: 'insensitive' } },
 ];
 }

 const allProducts = await prisma.product.findMany({
 where,
 include: {
 category: { select: { name: true } },
 images: { select: { url: true, isPrimary: true } },
 },
 orderBy: { name: 'asc' },
 });

 const formattedList = allProducts.map((p) => {
 const availableStock = p.stock - p.reservedStock;
 const isLowStock = availableStock <= p.minStock;
 return {
 id: p.id,
 sku: p.sku,
 name: p.name,
 slug: p.slug,
 category: p.category.name,
 currentStock: p.stock,
 reservedStock: p.reservedStock,
 availableStock,
 minStock: p.minStock,
 isLowStock,
 image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || '',
 };
 });

 const filtered = params.lowStockOnly
 ? formattedList.filter((item) => item.isLowStock)
 : formattedList;

 const totalItems = filtered.length;
 const paginatedItems = filtered.slice(skip, skip + limit);

 return {
 items: paginatedItems,
 summary: {
 totalProducts: allProducts.length,
 totalLowStockCount: formattedList.filter((i) => i.isLowStock).length,
 totalOutOfStockCount: formattedList.filter((i) => i.availableStock <= 0).length,
 },
 meta: {
 page,
 limit,
 totalItems,
 totalPages: Math.ceil(totalItems / limit),
 },
 };
 }

 static async adjustStock(adminUserId: string, input: AdjustStockInput) {
 const product = await prisma.product.findUnique({
 where: { id: input.productId },
 });

 if (!product) {
 const error: any = new Error('Product not found');
 error.statusCode = 404;
 throw error;
 }

 const stockIncrement = input.type === 'IN' ? input.quantity : -input.quantity;
 const newStock = product.stock + stockIncrement;

 if (newStock < 0) {
 const error: any = new Error('Cannot reduce stock below 0');
 error.statusCode = 400;
 throw error;
 }

 return await prisma.$transaction(async (tx) => {
 // 1. Update Product Stock
 const updatedProduct = await tx.product.update({
 where: { id: input.productId },
 data: { stock: { increment: stockIncrement } },
 });

 // 2. Create Inventory Movement Record
 const movement = await tx.inventoryMovement.create({
 data: {
 productId: input.productId,
 type: input.type,
 quantity: input.quantity,
 reference: `MANUAL_ADJUSTMENT_${Date.now()}`,
 notes: input.notes,
 },
 });

 // 3. Create System Audit Log
 await tx.auditLog.create({
 data: {
 userId: adminUserId,
 action: 'ADJUST_PRODUCT_STOCK',
 module: 'INVENTORY',
 recordId: input.productId,
 metadata: {
 sku: product.sku,
 type: input.type,
 quantity: input.quantity,
 oldStock: product.stock,
 newStock: updatedProduct.stock,
 notes: input.notes,
 },
 },
 });

 return { product: updatedProduct, movement };
 });
 }

 static async getMovements(productId?: string) {
 const where: Prisma.InventoryMovementWhereInput = {};
 if (productId) where.productId = productId;

 return await prisma.inventoryMovement.findMany({
 where,
 orderBy: { createdAt: 'desc' },
 take: 50,
 include: {
 product: { select: { id: true, sku: true, name: true } },
 },
 });
 }

 static async processExpiredPendingOrders() {
 const expirationThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 Hours ago

 const expiredOrders = await prisma.order.findMany({
 where: {
 orderStatus: OrderStatus.PENDING_PAYMENT,
 createdAt: { lt: expirationThreshold },
 },
 include: { items: true },
 });

 let count = 0;
 for (const order of expiredOrders) {
 await prisma.$transaction(async (tx) => {
 // Release reserved stock for each item
 for (const item of order.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: {
 reservedStock: { decrement: item.quantity },
 },
 });

 await tx.inventoryMovement.create({
 data: {
 productId: item.productId,
 type: 'RELEASE',
 quantity: item.quantity,
 reference: order.orderNumber,
 notes: 'Auto-release stock for expired pending payment order',
 },
 });
 }

 await tx.order.update({
 where: { id: order.id },
 data: {
 orderStatus: OrderStatus.EXPIRED,
 paymentStatus: PaymentStatus.EXPIRED,
 },
 });

 await tx.payment.update({
 where: { orderId: order.id },
 data: { status: PaymentStatus.EXPIRED },
 });
 });
 count++;
 }

 return { processedCount: count };
 }
}
