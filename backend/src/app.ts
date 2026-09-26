import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import addressRoutes from './routes/address.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import inventoryRoutes from './routes/inventory.routes';
import adminRoutes from './routes/admin.routes';
import promotionRoutes from './routes/promotion.routes';
import reviewRoutes from './routes/review.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middlewares/error.middleware';
import { globalLimiter } from './middlewares/rateLimit.middleware';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
 cors({
 origin: (origin, callback) => {
 // Allow requests with no origin (like mobile apps or curl requests) or localhost origins
 if (!origin || origin.startsWith('http://localhost:')) {
 return callback(null, true);
 }
 return callback(new Error('Not allowed by CORS'));
 },
 credentials: true,
 })
);

// Apply Global Rate Limiting to all /api endpoints
app.use('/api', globalLimiter);

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
 res.status(200).json({
 status: 'OK',
 service: 'E-Commerce & Order Management API',
 timestamp: new Date().toISOString(),
 });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api', reviewRoutes);

// 404 Handler
app.use('*', (req, res) => {
 res.status(404).json({
 success: false,
 error: {
 code: 'NOT_FOUND',
 message: `Cannot ${req.method} ${req.originalUrl}`,
 },
 });
});

// Global Error Handler
app.use(errorHandler);

export default app;
