import { Response } from 'express';

export interface MetaData {
 page?: number;
 limit?: number;
 totalItems?: number;
 totalPages?: number;
 [key: string]: any;
}

export const sendSuccess = (
 res: Response,
 message: string,
 data: any = null,
 statusCode = 200,
 meta?: MetaData
) => {
 return res.status(statusCode).json({
 success: true,
 message,
 data,
 meta,
 });
};

export const sendError = (
 res: Response,
 message: string,
 statusCode = 400,
 code = 'BAD_REQUEST',
 details: any = null
) => {
 return res.status(statusCode).json({
 success: false,
 error: {
 code,
 message,
 details,
 },
 });
};
