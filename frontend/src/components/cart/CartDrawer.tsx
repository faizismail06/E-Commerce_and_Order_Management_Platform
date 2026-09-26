import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../product/ProductCard';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
 const { cart, isDrawerOpen, setIsDrawerOpen, updateItemQuantity, removeItem } = useCart();

 if (!isDrawerOpen) return null;

 const items = cart?.items || [];
 const isEmpty = items.length === 0;

 return (
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div
 className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
 onClick={() => setIsDrawerOpen(false)}
 />

 <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
 <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
 {/* Header */}
 <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <ShoppingBag className="w-5 h-5 text-indigo-400" />
 <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
 <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
 {cart?.totalItems || 0}
 </span>
 </div>
 <button
 onClick={() => setIsDrawerOpen(false)}
 className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Cart Items List */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
 {isEmpty ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
 <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
 <ShoppingBag className="w-8 h-8 text-slate-600" />
 </div>
 <div>
 <h3 className="text-base font-bold text-white">Your cart is empty</h3>
 <p className="text-xs text-slate-400 mt-1">Explore our catalog to add items.</p>
 </div>
 <button
 onClick={() => setIsDrawerOpen(false)}
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
 >
 Browse Products
 </button>
 </div>
 ) : (
 items.map((item) => (
 <div
 key={item.id}
 className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex space-x-3 items-center"
 >
 <img
 src={item.image}
 alt={item.name}
 className="w-16 h-16 rounded-xl object-cover bg-slate-900 flex-shrink-0"
 />
 <div className="flex-1 min-w-0 space-y-1">
 <p className="font-bold text-xs text-white line-clamp-1">{item.name}</p>
 <p className="text-[11px] font-extrabold text-indigo-400">
 {formatRupiah(item.effectivePrice)}
 </p>

 {/* Quantity Controls */}
 <div className="flex items-center justify-between pt-1">
 <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
 <button
 onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
 className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
 >
 <Minus className="w-3 h-3" />
 </button>
 <span className="w-6 text-center text-xs font-bold text-white">
 {item.quantity}
 </span>
 <button
 onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
 className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
 >
 <Plus className="w-3 h-3" />
 </button>
 </div>

 <button
 onClick={() => removeItem(item.id)}
 className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Footer & Summary */}
 {!isEmpty && (
 <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/40 space-y-4">
 <div className="space-y-1.5 text-xs">
 <div className="flex justify-between text-slate-400">
 <span>Subtotal</span>
 <span className="text-slate-200 font-bold">{formatRupiah(cart?.subtotal || 0)}</span>
 </div>
 <div className="flex justify-between text-slate-400 items-center">
 <span className="flex items-center space-x-1">
 <Truck className="w-3.5 h-3.5 text-indigo-400" />
 <span>Est. Shipping ({cart?.totalWeight || 0}g)</span>
 </span>
 <span className="text-slate-200 font-bold">
 {formatRupiah(cart?.estimatedShippingCost || 0)}
 </span>
 </div>
 <div className="pt-2 border-t border-slate-800/80 flex justify-between text-sm font-extrabold text-white">
 <span>Grand Total</span>
 <span className="text-indigo-400">{formatRupiah(cart?.grandTotal || 0)}</span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <Link
 to="/cart"
 onClick={() => setIsDrawerOpen(false)}
 className="py-2.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
 >
 View Full Cart
 </Link>
 <Link
 to="/checkout"
 onClick={() => setIsDrawerOpen(false)}
 className="py-2.5 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-1 transition-all"
 >
 <span>Checkout</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};
