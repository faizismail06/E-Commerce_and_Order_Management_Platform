import { api } from './axios';

export interface DashboardMetrics {
 totalRevenue: number;
 totalOrders: number;
 pendingOrdersCount: number;
 activeProductsCount: number;
 lowStockProductsCount: number;
 totalCustomersCount: number;
}

export interface ShipOrderPayload {
 courier: string;
 courierService: string;
 trackingNumber: string;
}

export interface CustomerAdmin {
 id: string;
 fullName: string;
 email: string;
 phone: string | null;
 isActive: boolean;
 createdAt: string;
 totalOrders: number;
 totalSpending: number;
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
 const response = await api.get('/admin/metrics');
 return response.data.data;
};

export const fetchAdminOrders = async (params?: {
 status?: string;
 search?: string;
 page?: number;
 limit?: number;
}) => {
 const response = await api.get('/admin/orders', { params });
 return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
 const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
 return response.data.data;
};

export const shipOrder = async (orderId: string, payload: ShipOrderPayload) => {
 const response = await api.post(`/admin/orders/${orderId}/ship`, payload);
 return response.data.data;
};

export const fetchCustomers = async (search?: string): Promise<CustomerAdmin[]> => {
 const response = await api.get('/admin/customers', { params: { search } });
 return response.data.data;
};

export const toggleCustomerStatus = async (customerId: string): Promise<CustomerAdmin> => {
 const response = await api.patch(`/admin/customers/${customerId}/status`);
 return response.data.data;
};
