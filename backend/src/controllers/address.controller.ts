import { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/address.service';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator';
import { sendSuccess } from '../utils/response';

export class AddressController {
 static async getAddresses(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const addresses = await AddressService.getAddresses(userId);
 return sendSuccess(res, 'Delivery addresses retrieved', addresses);
 } catch (error) {
 next(error);
 }
 }

 static async createAddress(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const validated = createAddressSchema.parse(req.body);
 const address = await AddressService.createAddress(userId, validated);
 return sendSuccess(res, 'Address created successfully', address, 201);
 } catch (error) {
 next(error);
 }
 }

 static async updateAddress(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const validated = updateAddressSchema.parse(req.body);
 const address = await AddressService.updateAddress(userId, id, validated);
 return sendSuccess(res, 'Address updated successfully', address);
 } catch (error) {
 next(error);
 }
 }

 static async deleteAddress(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const result = await AddressService.deleteAddress(userId, id);
 return sendSuccess(res, result.message);
 } catch (error) {
 next(error);
 }
 }

 static async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const id = req.params.id as string;
 const address = await AddressService.setDefaultAddress(userId, id);
 return sendSuccess(res, 'Default address set successfully', address);
 } catch (error) {
 next(error);
 }
 }
}
