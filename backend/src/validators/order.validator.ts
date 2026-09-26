import { z } from 'zod';

export const createOrderSchema = z.object({
 addressId: z.string().uuid({ message: 'Invalid Address ID' }),
 courier: z.string().optional().default('JNE'),
 courierService: z.string().optional().default('REG'),
 couponCode: z.string().optional(),
 notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
