import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

export class AnalyticsService {
 static async getAnalyticsOverview(period: '7d' | '30d' | '12m' = '30d') {
 const now = new Date();
 let startDate = new Date();

 if (period === '7d') {
 startDate.setDate(now.getDate() - 7);
 } else if (period === '30d') {
 startDate.setDate(now.getDate() - 30);
 } else if (period === '12m') {
 startDate.setFullYear(now.getFullYear() - 1);
 }

 const validStatuses = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED];

 const [orders, aggregateResult] = await Promise.all([
 prisma.order.findMany({
 where: {
 orderStatus: { in: validStatuses },
 createdAt: { gte: startDate },
 },
 select: {
 id: true,
 grandTotal: true,
 discountAmount: true,
 createdAt: true,
 },
 orderBy: { createdAt: 'asc' },
 }),
 prisma.order.aggregate({
 where: {
 orderStatus: { in: validStatuses },
 createdAt: { gte: startDate },
 },
 _sum: { grandTotal: true, discountAmount: true },
 _count: { id: true },
 }),
 ]);

 const totalRevenue = aggregateResult._sum.grandTotal ? Number(aggregateResult._sum.grandTotal) : 0;
 const totalOrders = aggregateResult._count.id || 0;
 const totalDiscountGiven = aggregateResult._sum.discountAmount ? Number(aggregateResult._sum.discountAmount) : 0;
 const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

 // Time Series grouping (by day for 7d/30d, by month for 12m)
 const timeSeriesMap = new Map<string, { date: string; revenue: number; orders: number }>();

 orders.forEach((ord) => {
 const dateKey =
 period === '12m'
 ? ord.createdAt.toISOString().slice(0, 7) // YYYY-MM
 : ord.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD

 const amount = Number(ord.grandTotal);
 const existing = timeSeriesMap.get(dateKey) || { date: dateKey, revenue: 0, orders: 0 };
 existing.revenue += amount;
 existing.orders += 1;
 timeSeriesMap.set(dateKey, existing);
 });

 const chartData = Array.from(timeSeriesMap.values());

 return {
 summary: {
 totalRevenue,
 totalOrders,
 averageOrderValue,
 totalDiscountGiven,
 },
 chartData,
 };
 }

 static async getTopSellingProducts(limit = 5) {
 const validStatuses = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED];

 const topItems = await prisma.orderItem.groupBy({
 by: ['productId'],
 where: {
 order: {
 orderStatus: { in: validStatuses },
 },
 },
 _sum: {
 quantity: true,
 subtotal: true,
 },
 orderBy: {
 _sum: {
 quantity: 'desc',
 },
 },
 take: limit,
 });

 const productIds = topItems.map((item) => item.productId);
 const products = await prisma.product.findMany({
 where: { id: { in: productIds } },
 select: {
 id: true,
 name: true,
 sku: true,
 price: true,
 category: { select: { name: true } },
 images: { select: { url: true, isPrimary: true } },
 },
 });

 const productMap = new Map(products.map((p) => [p.id, p]));

 return topItems.map((item) => {
 const p = productMap.get(item.productId);
 return {
 productId: item.productId,
 name: p?.name || 'Unknown Product',
 sku: p?.sku || '-',
 category: p?.category?.name || '-',
 price: p ? Number(p.price) : 0,
 totalQuantitySold: item._sum.quantity || 0,
 totalRevenueGenerated: item._sum.subtotal ? Number(item._sum.subtotal) : 0,
 image: p?.images.find((i) => i.isPrimary)?.url || p?.images[0]?.url || '',
 };
 });
 }

 static async getCategorySalesDistribution() {
 const validStatuses = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED];

 const orderItems = await prisma.orderItem.findMany({
 where: {
 order: {
 orderStatus: { in: validStatuses },
 },
 },
 select: {
 subtotal: true,
 product: {
 select: {
 category: { select: { name: true } },
 },
 },
 },
 });

 const categoryMap = new Map<string, number>();
 let overallSales = 0;

 orderItems.forEach((item) => {
 const catName = item.product?.category?.name || 'Uncategorized';
 const amount = Number(item.subtotal);
 categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount);
 overallSales += amount;
 });

 return Array.from(categoryMap.entries()).map(([name, totalRevenue]) => {
 const percentage = overallSales > 0 ? Math.round((totalRevenue / overallSales) * 100) : 0;
 return {
 name,
 totalRevenue,
 percentage,
 };
 });
 }

 static async generateSalesReportCSV() {
 const orders = await prisma.order.findMany({
 orderBy: { createdAt: 'desc' },
 include: {
 user: { select: { fullName: true, email: true } },
 items: true,
 },
 });

 const headers = [
 'Order Number',
 'Date',
 'Customer Name',
 'Customer Email',
 'Order Status',
 'Payment Status',
 'Items Count',
 'Subtotal (Rp)',
 'Discount (Rp)',
 'Shipping Cost (Rp)',
 'Grand Total (Rp)',
 ];

 const rows = orders.map((o) => {
 const dateStr = new Date(o.createdAt).toLocaleString('id-ID');
 const itemsCount = o.items.reduce((acc, i) => acc + i.quantity, 0);
 return [
 o.orderNumber,
 `"${dateStr}"`,
 `"${o.user.fullName}"`,
 `"${o.user.email}"`,
 o.orderStatus,
 o.paymentStatus,
 itemsCount,
 Number(o.subtotal),
 Number(o.discountAmount),
 Number(o.shippingCost),
 Number(o.grandTotal),
 ].join(',');
 });

 return [headers.join(','), ...rows].join('\n');
 }
}
