import crypto from 'crypto';
import { verifyMidtransSignature } from '../../src/integrations/midtrans';

describe('Midtrans HMAC SHA-512 Webhook Signature Verification', () => {
 const serverKey = 'SB-Mid-server-TESTKEY12345';
 const orderId = 'ORD-20260923-000001';
 const statusCode = '200';
 const grossAmount = '2009000.00';

 it('should verify valid Midtrans SHA-512 signature', () => {
 const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
 const expectedSignature = crypto.createHash('sha512').update(payload).digest('hex');

 const isValid = verifyMidtransSignature(
 orderId,
 statusCode,
 grossAmount,
 serverKey,
 expectedSignature
 );

 expect(isValid).toBe(true);
 });

 it('should reject tampered signature', () => {
 const fakeSignature = 'bad_signature_hash_12345';

 const isValid = verifyMidtransSignature(
 orderId,
 statusCode,
 grossAmount,
 serverKey,
 fakeSignature
 );

 expect(isValid).toBe(false);
 });
});
