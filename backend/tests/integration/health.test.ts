import request from 'supertest';
import app from '../../src/app';

describe('API Integration Health Check', () => {
 it('GET /api/health should return 200 OK with service details', async () => {
 const res = await request(app).get('/api/health');

 expect(res.status).toBe(200);
 expect(res.body).toHaveProperty('status', 'OK');
 expect(res.body).toHaveProperty('service', 'E-Commerce & Order Management API');
 });

 it('GET /api/nonexistent-route should return 404 Not Found', async () => {
 const res = await request(app).get('/api/nonexistent-route');

 expect(res.status).toBe(404);
 expect(res.body.success).toBe(false);
 expect(res.body.error.code).toBe('NOT_FOUND');
 });
});
