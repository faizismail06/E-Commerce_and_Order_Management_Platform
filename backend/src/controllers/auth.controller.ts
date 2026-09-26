import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { sendSuccess } from '../utils/response';

export class AuthController {
 static async register(req: Request, res: Response, next: NextFunction) {
 try {
 const validatedData = registerSchema.parse(req.body);
 const result = await AuthService.register(validatedData);
 return sendSuccess(res, 'User registered successfully', result, 201);
 } catch (error) {
 next(error);
 }
 }

 static async login(req: Request, res: Response, next: NextFunction) {
 try {
 const validatedData = loginSchema.parse(req.body);
 const result = await AuthService.login(validatedData);
 return sendSuccess(res, 'User logged in successfully', result, 200);
 } catch (error) {
 next(error);
 }
 }

 static async getMe(req: Request, res: Response, next: NextFunction) {
 try {
 const userId = req.user!.userId;
 const profile = await AuthService.getProfile(userId);
 return sendSuccess(res, 'Profile retrieved successfully', profile, 200);
 } catch (error) {
 next(error);
 }
 }

 static async logout(req: Request, res: Response) {
 return sendSuccess(res, 'Logged out successfully', null, 200);
 }
}
