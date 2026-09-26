import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../components/product/ProductCard';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck, Scale, AlertCircle } from 'lucide-react';

export const CartPage: React.FC = () => {
 const { cart, isLoading, updateItemQuantity, removeItem, clearUserCart } = useCart();

 const items = cart?.items || [];
 const isEmpty = items.length === 0;

 if (isLoading) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex items-center justify-between pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
 <ShoppingBag className="w-8 h-8 text-indigo-400" />
 <span>Shopping Cart Engine</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Server-side recalculated pricing, stock validation, and total shipping fee calculation.
 </p>
 </div>

 {!isEmpty && (
 <button
 onClick={clearUserCart}
 className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
 >
 <Trash2 className="w-3.5 h-3.5" />
 <span>Clear Cart</span>
 </button>
 )}
 </div>

 {isEmpty ? (
 <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-4">
 <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
 <ShoppingBag className="w-8 h-8 text-indigo-400" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-white">Your shopping cart is empty</h3>
 <p className="text-xs text-slate-400 mt-1 max-w-sm">
 Discover our catalog of 50+ premium products and add items to your cart.
 </p>
 </div>
 <Link
 to="/catalog"
 className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
 >
 Browse Product Catalog
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Column: Cart Items List */}
 <div className="lg:col-span-2 space-y-4">
 {items.map((item) => (
 <div
 key={item.id}
 className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
 >
 <div className="flex items-center space-x-4">
 <img
 src={item.image}
 alt={item.name}
 className="w-20 h-20 rounded-xl object-cover bg-slate-950 flex-shrink-0"
 />
 <div className="space-y-1">
 <Link
 to={`/products/${item.slug}`}
 className="font-bold text-sm text-white hover:text-indigo-400 transition-colors line-clamp-1"
 >
 {item.name}
 </Link>
 <div className="flex items-center space-x-2 text-[11px] text-slate-400">
 <span className="font-mono text-slate-500">{item.sku}</span>
 <span>•</span>
 <span>{item.weight}g</span>
 </div>

 {!item.isStockSufficient && (
 <div className="flex items-center space-x-1 text-rose-400 text-[11px] font-semibold">
 <AlertCircle className="w-3.5 h-3.5" />
 <span>Only {item.availableStock} units available in stock!</span>
 </div>
 )}

 <p className="text-sm font-extrabold text-indigo-400">
 {formatRupiah(item.effectivePrice)}
 </p>
 </div>
 </div>

 {/* Right Action Bar */}
 <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
 <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
 <button
 onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
 className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
 >
 <Minus className="w-3.5 h-3.5" />
 </button>
 <span className="w-8 text-center text-xs font-bold text-white">
 {item.quantity}
 </span>
 <button
 onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
 className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
 >
 <Plus className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="text-right min-w-[90px]">
 <p className="text-xs text-slate-500">Subtotal</p>
 <p className="text-sm font-extrabold text-white">{formatRupiah(item.subtotal)}</p>
 </div>

 <button
 onClick={() => removeItem(item.id)}
 className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Right Column: Order Summary */}
 <div className="space-y-6">
 <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
 Order Price Summary
 </h2>

 <div className="space-y-3 text-xs">
 <div className="flex justify-between text-slate-400">
 <span>Subtotal ({cart?.totalItems} items)</span>
 <span className="text-slate-200 font-bold">{formatRupiah(cart?.subtotal || 0)}</span>
 </div>

 <div className="flex justify-between text-slate-400 items-center">
 <span className="flex items-center space-x-1.5">
 <Scale className="w-3.5 h-3.5 text-slate-400" />
 <span>Total Package Weight</span>
 </span>
 <span className="text-slate-200 font-mono font-bold">
 {cart?.totalWeight || 0}g
 </span>
 </div>

 <div className="flex justify-between text-slate-400 items-center">
 <span className="flex items-center space-x-1.5">
 <Truck className="w-3.5 h-3.5 text-indigo-400" />
 <span>Est. Courier Shipping Fee</span>
 </span>
 <span className="text-slate-200 font-bold">
 {formatRupiah(cart?.estimatedShippingCost || 0)}
 </span>
 </div>

 <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
 <span>Grand Total</span>
 <span className="text-indigo-400">{formatRupiah(cart?.grandTotal || 0)}</span>
 </div>
 </div>

 <Link
 to="/checkout"
 className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
 >
 <span>Proceed to Checkout</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>

 <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
 <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
 <ShieldCheck className="w-4 h-4" />
 <span>Backend Re-Validation Guarantee</span>
 </div>
 <p className="text-[11px] leading-relaxed">
 Stock availability and prices are strictly verified against the database before order creation.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
