import app from './app';
import { ENV } from './config/env';
import { prisma } from './config/prisma';

async function startServer() {
 try {
 await prisma.$connect();
 console.log('[x] Connected to PostgreSQL Database via Prisma');

 app.listen(ENV.PORT, () => {
 console.log(` Server listening on http://localhost:${ENV.PORT}`);
 console.log(` CORS Origin Whitelisted: ${ENV.CORS_ORIGIN}`);
 });
 } catch (error) {
 console.error('[ ] Failed to start server:', error);
 process.exit(1);
 }
}

startServer();
