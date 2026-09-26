import { z } from 'zod';

export const registerSchema = z.object({
 fullName: z
 .string()
 .min(2, { message: 'Full name must be at least 2 characters long' }),
 email: z
 .string()
 .email({ message: 'Please provide a valid email address' }),
 password: z
 .string()
 .min(8, { message: 'Password must be at least 8 characters long' })
 .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
 .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
 phone: z
 .string()
 .optional(),
});

export const loginSchema = z.object({
 email: z
 .string()
 .email({ message: 'Please provide a valid email address' }),
 password: z
 .string()
 .min(1, { message: 'Password is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
