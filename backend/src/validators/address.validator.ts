import { z } from 'zod';

export const createAddressSchema = z.object({
 recipientName: z.string().min(2, { message: 'Recipient name must be at least 2 characters' }),
 phone: z.string().min(8, { message: 'Phone number must be at least 8 digits' }),
 province: z.string().min(2, { message: 'Province is required' }),
 city: z.string().min(2, { message: 'City is required' }),
 district: z.string().min(2, { message: 'District is required' }),
 postalCode: z.string().min(3, { message: 'Postal code is required' }),
 fullAddress: z.string().min(10, { message: 'Full address must be at least 10 characters' }),
 label: z.string().min(2, { message: 'Label is required (e.g. Home, Office)' }),
 isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
