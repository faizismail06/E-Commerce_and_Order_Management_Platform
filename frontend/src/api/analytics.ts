import { api } from './axios';

export interface AnalyticsOverviewResponse {
 summary: {
 totalRevenue: number;
 totalOrders: number;
 averageOrderValue: number;
 totalDiscountGiven: number;
 };
 chartData: {
 date: string;
 revenue: number;
 orders: number;
 }[];
}

export interface TopProductAnalytics {
 productId: string;
 name: string;
 sku: string;
 category: string;
 price: number;
 totalQuantitySold: number;
 totalRevenueGenerated: number;
 image: string;
}

export interface CategoryDistributionAnalytics {
 name: string;
 totalRevenue: number;
 percentage: number;
}

export const fetchAnalyticsOverview = async (
 period: '7d' | '30d' | '12m' = '30d'
): Promise<AnalyticsOverviewResponse> => {
 const response = await api.get('/admin/analytics/overview', { params: { period } });
 return response.data.data;
};

export const fetchTopSellingProducts = async (limit = 5): Promise<TopProductAnalytics[]> => {
 const response = await api.get('/admin/analytics/top-products', { params: { limit } });
 return response.data.data;
};

export const fetchCategoryDistribution = async (): Promise<CategoryDistributionAnalytics[]> => {
 const response = await api.get('/admin/analytics/categories');
 return response.data.data;
};

export const downloadSalesReportCSV = async () => {
 const response = await api.get('/admin/analytics/export', {
 responseType: 'blob',
 });

 const blob = new Blob([response.data], { type: 'text/csv' });
 const url = window.URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.URL.revokeObjectURL(url);
};
