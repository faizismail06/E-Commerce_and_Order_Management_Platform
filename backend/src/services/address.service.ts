import { prisma } from '../config/prisma';
import { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator';

export class AddressService {
 static async getAddresses(userId: string) {
 return await prisma.address.findMany({
 where: { userId },
 orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
 });
 }

 static async createAddress(userId: string, input: CreateAddressInput) {
 const existingCount = await prisma.address.count({ where: { userId } });
 const isFirstAddress = existingCount === 0;
 const shouldBeDefault = isFirstAddress || input.isDefault;

 if (shouldBeDefault) {
 await prisma.address.updateMany({
 where: { userId },
 data: { isDefault: false },
 });
 }

 return await prisma.address.create({
 data: {
 userId,
 recipientName: input.recipientName,
 phone: input.phone,
 province: input.province,
 city: input.city,
 district: input.district,
 postalCode: input.postalCode,
 fullAddress: input.fullAddress,
 label: input.label,
 isDefault: shouldBeDefault,
 },
 });
 }

 static async updateAddress(userId: string, addressId: string, input: UpdateAddressInput) {
 const existing = await prisma.address.findFirst({
 where: { id: addressId, userId },
 });

 if (!existing) {
 const error: any = new Error('Delivery address not found');
 error.statusCode = 404;
 throw error;
 }

 if (input.isDefault) {
 await prisma.address.updateMany({
 where: { userId },
 data: { isDefault: false },
 });
 }

 return await prisma.address.update({
 where: { id: addressId },
 data: input,
 });
 }

 static async deleteAddress(userId: string, addressId: string) {
 const existing = await prisma.address.findFirst({
 where: { id: addressId, userId },
 });

 if (!existing) {
 const error: any = new Error('Delivery address not found');
 error.statusCode = 404;
 throw error;
 }

 await prisma.address.delete({
 where: { id: addressId },
 });

 // If deleted address was default, set another address as default
 if (existing.isDefault) {
 const nextAddress = await prisma.address.findFirst({
 where: { userId },
 orderBy: { createdAt: 'desc' },
 });
 if (nextAddress) {
 await prisma.address.update({
 where: { id: nextAddress.id },
 data: { isDefault: true },
 });
 }
 }

 return { message: 'Address deleted successfully' };
 }

 static async setDefaultAddress(userId: string, addressId: string) {
 const existing = await prisma.address.findFirst({
 where: { id: addressId, userId },
 });

 if (!existing) {
 const error: any = new Error('Delivery address not found');
 error.statusCode = 404;
 throw error;
 }

 await prisma.address.updateMany({
 where: { userId },
 data: { isDefault: false },
 });

 return await prisma.address.update({
 where: { id: addressId },
 data: { isDefault: true },
 });
 }
}
