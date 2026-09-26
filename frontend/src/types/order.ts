import { Address } from './address';

export type OrderStatus =
 | 'PENDING_PAYMENT'
 | 'PAID'
 | 'PROCESSING'
 | 'SHIPPED'
 | 'DELIVERED'
 | 'COMPLETED'
 | 'CANCELLED'
 | 'PAYMENT_FAILED'
 | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface OrderItem {
 id: string;
 orderId: string;
 productId: string;
 name: string;
 price: number | string;
 quantity: number;
 subtotal: number | string;
 product?: {
 id: string;
 slug: string;
 images: { url: string; isPrimary: boolean }[];
 };
}

export interface Payment {
 id: string;
 orderId: string;
 snapToken?: string | null;
 snapRedirectUrl?: string | null;
 paymentType?: string | null;
 transactionId?: string | null;
 transactionStatus?: string | null;
 status: PaymentStatus;
 paidAt?: string | null;
}

export interface Order {
 id: string;
 orderNumber: string;
 userId: string;
 addressId: string;
 address: Address;
 subtotal: number | string;
 discountAmount: number | string;
 shippingCost: number | string;
 grandTotal: number | string;
 orderStatus: OrderStatus;
 paymentStatus: PaymentStatus;
 courier?: string | null;
 courierService?: string | null;
 trackingNumber?: string | null;
 shippedAt?: string | null;
 items: OrderItem[];
 payment?: Payment | null;
 user?: {
 id: string;
 fullName: string;
 email: string;
 phone?: string | null;
 };
 createdAt: string;
 updatedAt: string;
}

export interface CreateOrderPayload {
 addressId: string;
 courier?: string;
 courierService?: string;
 couponCode?: string;
 notes?: string;
}
