import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 Minutes
 max: 200, // Max 200 requests per window
 standardHeaders: true,
 legacyHeaders: false,
 message: {
 success: false,
 error: {
 code: 'TOO_MANY_REQUESTS',
 message: 'Too many requests from this IP, please try again after 15 minutes.',
 },
 },
});

export const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 Minutes
 max: 20, // Max 20 attempts per window
 standardHeaders: true,
 legacyHeaders: false,
 message: {
 success: false,
 error: {
 code: 'TOO_MANY_AUTH_ATTEMPTS',
 message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
 },
 },
});
