export interface InventoryItem {
 id: string;
 sku: string;
 name: string;
 slug: string;
 category: string;
 currentStock: number;
 reservedStock: number;
 availableStock: number;
 minStock: number;
 isLowStock: boolean;
 image: string;
}

export interface InventorySummary {
 totalProducts: number;
 totalLowStockCount: number;
 totalOutOfStockCount: number;
}

export interface InventoryMovement {
 id: string;
 productId: string;
 product?: {
 id: string;
 sku: string;
 name: string;
 };
 type: 'IN' | 'OUT' | 'RESERVE' | 'RELEASE';
 quantity: number;
 reference: string;
 notes?: string | null;
 createdAt: string;
}

export interface StockAdjustmentPayload {
 productId: string;
 type: 'IN' | 'OUT';
 quantity: number;
 notes: string;
}
