export interface CartItem {
 id: string;
 productId: string;
 name: string;
 slug: string;
 sku: string;
 unitPrice: number;
 effectivePrice: number;
 quantity: number;
 subtotal: number;
 weight: number;
 availableStock: number;
 isStockSufficient: boolean;
 image: string;
 category: string;
}

export interface Cart {
 id: string;
 items: CartItem[];
 totalItems: number;
 totalWeight: number; // in grams
 subtotal: number;
 discountAmount: number;
 estimatedShippingCost: number;
 grandTotal: number;
}
