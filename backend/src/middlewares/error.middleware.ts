import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (
 err: any,
 req: Request,
 res: Response,
 next: NextFunction
) => {
 console.error('[ ] Global Error Handler:', err);

 if (err instanceof ZodError) {
 const formattedErrors = err.errors.map((e) => ({
 field: e.path.join('.'),
 message: e.message,
 }));
 return sendError(
 res,
 'Validation error failed',
 400,
 'VALIDATION_ERROR',
 formattedErrors
 );
 }

 const statusCode = err.statusCode || 500;
 const message = err.message || 'Internal server error occurred';
 const code = err.code || 'INTERNAL_SERVER_ERROR';

 return sendError(res, message, statusCode, code, err.details || null);
};
