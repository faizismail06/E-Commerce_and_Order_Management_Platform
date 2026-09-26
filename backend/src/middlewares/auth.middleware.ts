import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticateToken = (
 req: Request,
 res: Response,
 next: NextFunction
) => {
 const authHeader = req.headers.authorization;
 const token = authHeader && authHeader.split(' ')[1];

 if (!token) {
 return sendError(res, 'Authentication token required', 401, 'UNAUTHORIZED');
 }

 try {
 const decodedPayload = verifyToken(token);
 req.user = decodedPayload;
 next();
 } catch (error) {
 return sendError(res, 'Invalid or expired authentication token', 401, 'UNAUTHORIZED');
 }
};

export const requireRoles = (...allowedRoles: string[]) => {
 return (req: Request, res: Response, next: NextFunction) => {
 if (!req.user) {
 return sendError(res, 'User authentication required', 401, 'UNAUTHORIZED');
 }

 if (!allowedRoles.includes(req.user.role)) {
 return sendError(
 res,
 'You do not have permission to access this resource',
 403,
 'FORBIDDEN'
 );
 }

 next();
 };
};
