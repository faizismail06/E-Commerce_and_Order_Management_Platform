import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { fetchAddresses } from '../api/address';
import { createOrder } from '../api/orders';
import { applyCoupon, AppliedCouponResult } from '../api/promotions';
import { formatRupiah } from '../components/product/ProductCard';
import {
 CreditCard,
 MapPin,
 Truck,
 ShoppingBag,
 ArrowLeft,
 CheckCircle2,
 AlertCircle,
 Plus,
 Lock,
 Tag,
 X,
} from 'lucide-react';

declare global {
 interface Window {
 snap?: any;
 }
}

export const CheckoutPage: React.FC = () => {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const { cart, clearUserCart } = useCart();

 const [selectedAddressId, setSelectedAddressId] = useState<string>('');
 const [courier, setCourier] = useState('JNE');
 const [courierService, setCourierService] = useState('REG');
 const [notes, setNotes] = useState('');
 const [errorMsg, setErrorMsg] = useState<string | null>(null);
 const [isProcessing, setIsProcessing] = useState(false);

 // Coupon state
 const [couponInput, setCouponInput] = useState('');
 const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponResult | null>(null);
 const [couponError, setCouponError] = useState<string | null>(null);
 const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

 // 1. Fetch User Addresses
 const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
 queryKey: ['addresses'],
 queryFn: fetchAddresses,
 });

 // Set default selected address once loaded
 useEffect(() => {
 if (addresses.length > 0 && !selectedAddressId) {
 const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
 setSelectedAddressId(defaultAddr.id);
 }
 }, [addresses, selectedAddressId]);

 // 2. Load Midtrans Snap JS Script
 useEffect(() => {
 const snapUrl = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
 const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-jS6re3d154mUXj86';

 const existingScript = document.getElementById('midtrans-script');
 if (existingScript) {
 existingScript.remove();
 }

 const script = document.createElement('script');
 script.src = snapUrl;
 script.id = 'midtrans-script';
 script.setAttribute('data-client-key', clientKey);
 document.body.appendChild(script);
 }, []);

 const createOrderMutation = useMutation({
 mutationFn: createOrder,
 });

 const items = cart?.items || [];
 const isEmpty = items.length === 0;

 const handleApplyCoupon = async (e: React.FormEvent) => {
 e.preventDefault();
 setCouponError(null);
 if (!couponInput.trim()) return;

 setIsVerifyingCoupon(true);
 try {
 const result = await applyCoupon(couponInput.trim(), cart?.subtotal || 0);
 setAppliedCoupon(result);
 setCouponError(null);
 } catch (err: any) {
 const msg = err.response?.data?.error?.message || 'Invalid promo code';
 setCouponError(msg);
 setAppliedCoupon(null);
 } finally {
 setIsVerifyingCoupon(false);
 }
 };

 const handleRemoveCoupon = () => {
 setAppliedCoupon(null);
 setCouponInput('');
 setCouponError(null);
 };

 const handleCheckoutSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMsg(null);

 if (!selectedAddressId) {
 setErrorMsg('Please select a delivery address');
 return;
 }

 setIsProcessing(true);

 try {
 const result = await createOrderMutation.mutateAsync({
 addressId: selectedAddressId,
 courier,
 courierService,
 couponCode: appliedCoupon?.code,
 notes,
 });

 // Clear cart context
 await clearUserCart();
 queryClient.invalidateQueries({ queryKey: ['cart'] });
 queryClient.invalidateQueries({ queryKey: ['orders'] });

 const snapToken = result.snapToken;

 // Trigger official Midtrans Snap Popup Window
 if (window.snap && snapToken) {
 window.snap.pay(snapToken, {
 onSuccess: function (res: any) {
 console.log('Midtrans Snap Success:', res);
 navigate(`/orders/${res.order_id || result.order?.id || ''}`);
 },
 onPending: function (res: any) {
 console.log('Midtrans Snap Pending:', res);
 navigate('/orders');
 },
 onError: function (res: any) {
 console.error('Midtrans Snap Error:', res);
 navigate('/orders');
 },
 onClose: function () {
 console.log('Customer closed Midtrans Snap popup');
 navigate('/orders');
 },
 });
 } else {
 navigate(`/orders/${result.order?.id || ''}`);
 }
 } catch (err: any) {
 const msg = err.response?.data?.error?.message || 'Checkout failed. Please try again.';
 setErrorMsg(msg);
 } finally {
 setIsProcessing(false);
 }
 };

 if (isEmpty) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
 <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
 <ShoppingBag className="w-8 h-8 text-indigo-400" />
 </div>
 <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 Add items to your cart before proceeding to checkout.
 </p>
 <Link
 to="/catalog"
 className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>Browse Product Catalog</span>
 </Link>
 </div>
 );
 }

 const subtotal = cart?.subtotal || 0;
 const shippingFee = cart?.estimatedShippingCost || 0;
 const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
 const grandTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex items-center justify-between pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
 <CreditCard className="w-8 h-8 text-indigo-400" />
 <span>Secure Checkout Pipeline</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Midtrans Snap Sandbox Payment Gateway with HMAC SHA-512 Signature Validation.
 </p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
 <AlertCircle className="w-4 h-4 flex-shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Column: Address & Delivery Options */}
 <div className="lg:col-span-2 space-y-6">
 {/* Step 1: Select Address */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <div className="flex items-center justify-between border-b border-slate-800 pb-3">
 <h2 className="text-base font-bold text-white flex items-center space-x-2">
 <MapPin className="w-5 h-5 text-indigo-400" />
 <span>1. Delivery Shipping Address</span>
 </h2>
 <Link
 to="/addresses"
 className="text-xs text-indigo-400 font-semibold hover:underline flex items-center space-x-1"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>Manage Addresses</span>
 </Link>
 </div>

 {isLoadingAddresses ? (
 <p className="text-xs text-slate-500">Loading delivery addresses...</p>
 ) : addresses.length === 0 ? (
 <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
 <p className="font-semibold">No delivery addresses found!</p>
 <Link
 to="/addresses"
 className="inline-block px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
 >
 Add Address Now
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {addresses.map((addr) => (
 <div
 key={addr.id}
 onClick={() => setSelectedAddressId(addr.id)}
 className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
 selectedAddressId === addr.id
 ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/30'
 : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
 {addr.label}
 </span>
 {addr.isDefault && (
 <span className="text-[10px] text-emerald-400 font-bold">DEFAULT</span>
 )}
 </div>
 <p className="font-bold text-xs text-white">{addr.recipientName}</p>
 <p className="text-[11px] text-slate-400 line-clamp-2">{addr.fullAddress}</p>
 <p className="text-[10px] text-slate-500">
 {addr.city}, {addr.province} {addr.postalCode}
 </p>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Step 2: Select Courier */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
 <Truck className="w-5 h-5 text-indigo-400" />
 <span>2. Select Shipping Courier</span>
 </h2>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { name: 'JNE', service: 'REG', label: 'JNE Regular' },
 { name: 'J&T', service: 'EZ', label: 'J&T Express' },
 { name: 'POS', service: 'KILAT', label: 'POS Kilat' },
 { name: 'TIKI', service: 'ONS', label: 'TIKI ONS' },
 ].map((c) => (
 <button
 type="button"
 key={c.name}
 onClick={() => {
 setCourier(c.name);
 setCourierService(c.service);
 }}
 className={`p-3 rounded-xl border text-center transition-all ${
 courier === c.name
 ? 'bg-indigo-600/10 border-indigo-500 text-white font-bold'
 : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 <p className="text-xs font-bold">{c.name}</p>
 <p className="text-[10px] text-slate-500">{c.service}</p>
 </button>
 ))}
 </div>
 </div>

 {/* Step 3: Order Items Snapshot */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
 3. Order Line Items ({items.length} Products)
 </h2>

 <div className="divide-y divide-slate-800/80">
 {items.map((item) => (
 <div key={item.id} className="py-3 flex items-center justify-between text-xs">
 <div className="flex items-center space-x-3">
 <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-950" />
 <div>
 <p className="font-bold text-white line-clamp-1">{item.name}</p>
 <p className="text-[11px] text-slate-400">
 {item.quantity} x {formatRupiah(item.effectivePrice)}
 </p>
 </div>
 </div>
 <span className="font-extrabold text-indigo-400">{formatRupiah(item.subtotal)}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Right Column: Checkout Summary, Coupon & Midtrans Trigger */}
 <div className="space-y-6">
 {/* Promo Coupon Widget */}
 <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
 <Tag className="w-4 h-4 text-emerald-400" />
 <span>Promo Code / Voucher</span>
 </h2>

 {appliedCoupon ? (
 <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
 <div>
 <p className="font-bold font-mono">{appliedCoupon.code}</p>
 <p className="text-[10px] text-emerald-400 mt-0.5">
 Saved {formatRupiah(appliedCoupon.discountAmount)}
 </p>
 </div>
 <button
 type="button"
 onClick={handleRemoveCoupon}
 className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:text-white"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <div className="space-y-2">
 <div className="flex space-x-2">
 <input
 type="text"
 placeholder="Enter code e.g. WELCOME10"
 value={couponInput}
 onChange={(e) => setCouponInput(e.target.value)}
 className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
 />
 <button
 type="button"
 onClick={handleApplyCoupon}
 disabled={isVerifyingCoupon || !couponInput.trim()}
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors"
 >
 {isVerifyingCoupon ? 'Checking...' : 'Apply'}
 </button>
 </div>
 {couponError && (
 <p className="text-[11px] text-rose-400 font-medium">{couponError}</p>
 )}
 <p className="text-[10px] text-slate-500 italic">
 Try demo codes: <span className="font-mono text-indigo-400 font-bold">WELCOME10</span>,{' '}
 <span className="font-mono text-indigo-400 font-bold">BIGSALE50</span>, or{' '}
 <span className="font-mono text-indigo-400 font-bold">SUPERVIP</span>
 </p>
 </div>
 )}
 </div>

 {/* Payment Summary */}
 <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
 Order Payment Summary
 </h2>

 <div className="space-y-3 text-xs">
 <div className="flex justify-between text-slate-400">
 <span>Items Subtotal</span>
 <span className="text-slate-200 font-bold">{formatRupiah(subtotal)}</span>
 </div>

 {appliedCoupon && (
 <div className="flex justify-between text-emerald-400">
 <span>Discount ({appliedCoupon.code})</span>
 <span className="font-bold">-{formatRupiah(discountAmount)}</span>
 </div>
 )}

 <div className="flex justify-between text-slate-400">
 <span>Shipping Fee ({cart?.totalWeight}g)</span>
 <span className="text-slate-200 font-bold">{formatRupiah(shippingFee)}</span>
 </div>

 <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
 <span>Grand Total</span>
 <span className="text-indigo-400">{formatRupiah(grandTotal)}</span>
 </div>
 </div>

 <button
 type="submit"
 disabled={isProcessing || !selectedAddressId}
 className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
 >
 <Lock className="w-4 h-4" />
 <span>{isProcessing ? 'Processing Order...' : 'Pay with Midtrans Snap'}</span>
 </button>
 </div>
 </div>
 </form>
 </div>
 );
};

export default CheckoutPage;
