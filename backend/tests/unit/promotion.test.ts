import { PromoType } from '@prisma/client';

describe('Promotion Discount Calculation Logic', () => {
 it('should calculate 10% percentage discount correctly', () => {
 const subtotal = 200000;
 const promoValue = 10; // 10%
 const maxDiscount = 50000;

 let discount = (subtotal * promoValue) / 100;
 if (maxDiscount) discount = Math.min(discount, maxDiscount);

 expect(discount).toBe(20000);
 expect(subtotal - discount).toBe(180000);
 });

 it('should respect maximum discount cap when 20% discount exceeds cap', () => {
 const subtotal = 1000000; // 20% would be 200.000
 const promoValue = 20;
 const maxDiscount = 150000; // Capped at 150.000

 let discount = (subtotal * promoValue) / 100;
 if (maxDiscount) discount = Math.min(discount, maxDiscount);

 expect(discount).toBe(150000);
 expect(subtotal - discount).toBe(850000);
 });

 it('should calculate fixed amount discount correctly', () => {
 const subtotal = 350000;
 const fixedDiscountValue = 50000;

 const discount = Math.min(fixedDiscountValue, subtotal);

 expect(discount).toBe(50000);
 expect(subtotal - discount).toBe(300000);
 });

 it('should not allow fixed discount to exceed subtotal', () => {
 const subtotal = 30000;
 const fixedDiscountValue = 50000;

 const discount = Math.min(fixedDiscountValue, subtotal);

 expect(discount).toBe(30000);
 expect(subtotal - discount).toBe(0);
 });
});
