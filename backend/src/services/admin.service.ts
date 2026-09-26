import { Prisma, OrderStatus, RoleName } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ShipOrderInput, AdminOrderQueryParams } from '../validators/admin.validator';

export class AdminService {
 // Order Management & Fulfillment
 static async getAdminOrders(params: AdminOrderQueryParams) {
 const page = Math.max(1, params.page || 1);
 const limit = Math.max(1, Math.min(100, params.limit || 20));
 const skip = (page - 1) * limit;

 const where: Prisma.OrderWhereInput = {};

 if (params.status && params.status !== 'ALL') {
 where.orderStatus = params.status as OrderStatus;
 }

 if (params.search) {
 where.OR = [
 { orderNumber: { contains: params.search, mode: 'insensitive' } },
 { user: { email: { contains: params.search, mode: 'insensitive' } } },
 { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
 { address: { recipientName: { contains: params.search, mode: 'insensitive' } } },
 ];
 }

 const [orders, totalItems] = await Promise.all([
 prisma.order.findMany({
 where,
 skip,
 take: limit,
 orderBy: { createdAt: 'desc' },
 include: {
 user: { select: { id: true, fullName: true, email: true, phone: true } },
 address: true,
 payment: { select: { status: true, paidAt: true, paymentType: true } },
 items: true,
 },
 }),
 prisma.order.count({ where }),
 ]);

 return {
 orders,
 meta: {
 page,
 limit,
 totalItems,
 totalPages: Math.ceil(totalItems / limit),
 },
 };
 }

 static async updateOrderStatus(adminUserId: string, orderId: string, status: OrderStatus) {
 const order = await prisma.order.findUnique({
 where: { id: orderId },
 });

 if (!order) {
 const error: any = new Error('Order not found');
 error.statusCode = 404;
 throw error;
 }

 const oldStatus = order.orderStatus;

 const updatedOrder = await prisma.$transaction(async (tx) => {
 const result = await tx.order.update({
 where: { id: orderId },
 data: { orderStatus: status },
 });

 await tx.auditLog.create({
 data: {
 userId: adminUserId,
 action: 'UPDATE_ORDER_STATUS',
 module: 'ORDER',
 recordId: orderId,
 metadata: {
 orderNumber: order.orderNumber,
 oldStatus,
 newStatus: status,
 },
 },
 });

 return result;
 });

 return updatedOrder;
 }

 static async shipOrder(adminUserId: string, orderId: string, input: ShipOrderInput) {
 const order = await prisma.order.findUnique({
 where: { id: orderId },
 });

 if (!order) {
 const error: any = new Error('Order not found');
 error.statusCode = 404;
 throw error;
 }

 return await prisma.$transaction(async (tx) => {
 const updatedOrder = await tx.order.update({
 where: { id: orderId },
 data: {
 orderStatus: OrderStatus.SHIPPED,
 courier: input.courier,
 courierService: input.courierService,
 trackingNumber: input.trackingNumber,
 shippedAt: new Date(),
 },
 });

 await tx.auditLog.create({
 data: {
 userId: adminUserId,
 action: 'DISPATCH_SHIPPING_ORDER',
 module: 'ORDER',
 recordId: orderId,
 metadata: {
 orderNumber: order.orderNumber,
 courier: input.courier,
 courierService: input.courierService,
 trackingNumber: input.trackingNumber,
 },
 },
 });

 return updatedOrder;
 });
 }

 // Customer Account Management
 static async getCustomers(search = '') {
 const customerRole = await prisma.role.findUnique({
 where: { name: RoleName.CUSTOMER },
 });

 if (!customerRole) return [];

 const where: Prisma.UserWhereInput = {
 roleId: customerRole.id,
 };

 if (search) {
 where.OR = [
 { fullName: { contains: search, mode: 'insensitive' } },
 { email: { contains: search, mode: 'insensitive' } },
 { phone: { contains: search, mode: 'insensitive' } },
 ];
 }

 const customers = await prisma.user.findMany({
 where,
 orderBy: { createdAt: 'desc' },
 select: {
 id: true,
 fullName: true,
 email: true,
 phone: true,
 isActive: true,
 createdAt: true,
 orders: {
 select: {
 id: true,
 grandTotal: true,
 orderStatus: true,
 },
 },
 },
 });

 return customers.map((c) => {
 const completedOrders = c.orders.filter(
 (o) => o.orderStatus === OrderStatus.PAID || o.orderStatus === OrderStatus.COMPLETED
 );
 const totalSpending = completedOrders.reduce(
 (acc, o) => acc + (typeof o.grandTotal === 'string' ? parseFloat(o.grandTotal) : Number(o.grandTotal)),
 0
 );

 return {
 id: c.id,
 fullName: c.fullName,
 email: c.email,
 phone: c.phone,
 isActive: c.isActive,
 createdAt: c.createdAt,
 totalOrders: c.orders.length,
 totalSpending,
 };
 });
 }

 static async toggleCustomerStatus(adminUserId: string, customerId: string) {
 const customer = await prisma.user.findUnique({
 where: { id: customerId },
 });

 if (!customer) {
 const error: any = new Error('Customer account not found');
 error.statusCode = 404;
 throw error;
 }

 const newStatus = !customer.isActive;

 return await prisma.$transaction(async (tx) => {
 const updatedUser = await tx.user.update({
 where: { id: customerId },
 data: { isActive: newStatus },
 });

 await tx.auditLog.create({
 data: {
 userId: adminUserId,
 action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
 module: 'USER',
 recordId: customerId,
 metadata: {
 email: customer.email,
 previousStatus: customer.isActive,
 newStatus,
 },
 },
 });

 return updatedUser;
 });
 }

 // Dashboard Metrics
 static async getDashboardMetrics() {
 const customerRole = await prisma.role.findUnique({
 where: { name: RoleName.CUSTOMER },
 });

 const [
 totalOrders,
 pendingOrdersCount,
 paidOrdersSum,
 allProducts,
 totalCustomersCount,
 ] = await Promise.all([
 prisma.order.count(),
 prisma.order.count({ where: { orderStatus: OrderStatus.PENDING_PAYMENT } }),
 prisma.order.aggregate({
 where: {
 orderStatus: {
 in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
 },
 },
 _sum: { grandTotal: true },
 }),
 prisma.product.findMany({
 where: { isActive: true },
 select: { stock: true, reservedStock: true, minStock: true },
 }),
 customerRole
 ? prisma.user.count({ where: { roleId: customerRole.id } })
 : 0,
 ]);

 const totalRevenue = paidOrdersSum._sum.grandTotal
 ? Number(paidOrdersSum._sum.grandTotal)
 : 0;

 const lowStockProductsCount = allProducts.filter(
 (p) => p.stock - p.reservedStock <= p.minStock
 ).length;

 return {
 totalRevenue,
 totalOrders,
 pendingOrdersCount,
 activeProductsCount: allProducts.length,
 lowStockProductsCount,
 totalCustomersCount,
 };
 }
}

