import { api } from './axios';
import { InventoryItem, InventorySummary, InventoryMovement, StockAdjustmentPayload } from '../types/inventory';

export const fetchInventory = async (
 search = '',
 lowStockOnly = false
): Promise<{ items: InventoryItem[]; summary: InventorySummary }> => {
 const params: Record<string, any> = {};
 if (search) params.search = search;
 if (lowStockOnly) params.lowStockOnly = true;

 const response = await api.get('/admin/inventory', { params });
 return response.data?.data;
};

export const adjustStock = async (payload: StockAdjustmentPayload): Promise<any> => {
 const response = await api.post('/admin/inventory/adjust', payload);
 return response.data?.data;
};

export const fetchMovements = async (productId?: string): Promise<InventoryMovement[]> => {
 const params = productId ? { productId } : {};
 const response = await api.get('/admin/inventory/movements', { params });
 return response.data?.data || [];
};

export const triggerExpiredScan = async (): Promise<any> => {
 const response = await api.post('/admin/inventory/expire-scan');
 return response.data?.data;
};
