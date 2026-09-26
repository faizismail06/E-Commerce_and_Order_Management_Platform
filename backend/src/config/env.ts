import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
 PORT: process.env.PORT || 5001,
 NODE_ENV: process.env.NODE_ENV || 'development',
 DATABASE_URL: process.env.DATABASE_URL || '',
 JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_ecommerce_2026',
 JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
 CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5174',
 FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5174',
 MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',
 MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || '',
 MIDTRANS_MERCHANT_ID: process.env.MIDTRANS_MERCHANT_ID || '',
 MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === 'true',
};
