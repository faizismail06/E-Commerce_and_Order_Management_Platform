import { z } from 'zod';

export const addToCartSchema = z.object({
 productId: z.string().uuid({ message: 'Invalid Product ID' }),
 quantity: z
 .number()
 .int({ message: 'Quantity must be an integer' })
 .positive({ message: 'Quantity must be at least 1' }),
});

export const updateCartItemSchema = z.object({
 quantity: z
 .number()
 .int({ message: 'Quantity must be an integer' })
 .positive({ message: 'Quantity must be at least 1' }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
