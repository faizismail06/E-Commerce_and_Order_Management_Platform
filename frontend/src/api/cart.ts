import { api } from './axios';
import { Cart } from '../types/cart';

export const fetchCart = async (): Promise<Cart> => {
 const response = await api.get('/cart');
 return response.data?.data;
};

export const addToCart = async (productId: string, quantity = 1): Promise<Cart> => {
 const response = await api.post('/cart/items', { productId, quantity });
 return response.data?.data;
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
 const response = await api.put(`/cart/items/${itemId}`, { quantity });
 return response.data?.data;
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
 const response = await api.delete(`/cart/items/${itemId}`);
 return response.data?.data;
};

export const clearCart = async (): Promise<Cart> => {
 const response = await api.delete('/cart');
 return response.data?.data;
};
