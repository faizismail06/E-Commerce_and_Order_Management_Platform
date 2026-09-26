import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const shipOrderSchema = z.object({
 courier: z.string().min(2, { message: 'Courier name is required (e.g. JNE, J&T)' }),
 courierService: z.string().min(2, { message: 'Courier service is required (e.g. REG, YES)' }),
 trackingNumber: z.string().min(5, { message: 'Tracking number (AWB) must be at least 5 characters' }),
});

export const updateOrderStatusSchema = z.object({
 status: z.nativeEnum(OrderStatus, { message: 'Invalid Order Status' }),
});

export const adminOrderQuerySchema = z.object({
 page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
 limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
 search: z.string().optional(),
 status: z.string().optional(),
});

export type ShipOrderInput = z.infer<typeof shipOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AdminOrderQueryParams = z.infer<typeof adminOrderQuerySchema>;
