import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import { ENV } from '../config/env';

export const snap = new midtransClient.Snap({
 isProduction: ENV.MIDTRANS_IS_PRODUCTION,
 serverKey: ENV.MIDTRANS_SERVER_KEY,
 clientKey: ENV.MIDTRANS_CLIENT_KEY,
});

export const verifyMidtransSignature = (
 orderId: string,
 statusCode: string,
 grossAmount: string,
 serverKey: string,
 signatureKey: string
): boolean => {
 const hash = crypto
 .createHash('sha512')
 .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
 .digest('hex');

 return hash === signatureKey;
};
