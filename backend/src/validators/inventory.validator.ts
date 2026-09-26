import { z } from 'zod';

export const adjustStockSchema = z.object({
 productId: z.string().uuid({ message: 'Invalid Product ID' }),
 type: z.enum(['IN', 'OUT'], { message: 'Type must be IN or OUT' }),
 quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
 notes: z.string().min(3, { message: 'Notes/Reason must be at least 3 characters' }),
});

export const inventoryQuerySchema = z.object({
 page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
 limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
 search: z.string().optional(),
 lowStockOnly: z.string().optional().transform((val) => val === 'true'),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type InventoryQueryParams = z.infer<typeof inventoryQuerySchema>;
