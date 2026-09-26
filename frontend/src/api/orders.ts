import { api } from './axios';
import { Order, CreateOrderPayload } from '../types/order';

export const createOrder = async (
 payload: CreateOrderPayload
): Promise<{ order: Order; snapToken: string }> => {
 const response = await api.post('/orders', payload);
 return response.data?.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
 const response = await api.get('/orders');
 return response.data?.data || [];
};

export const fetchOrderById = async (id: string): Promise<Order> => {
 const response = await api.get(`/orders/${id}`);
 return response.data?.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
 const response = await api.post(`/orders/${id}/cancel`);
 return response.data?.data;
};
