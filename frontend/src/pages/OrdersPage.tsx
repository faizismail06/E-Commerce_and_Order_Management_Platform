import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchOrders, cancelOrder } from '../api/orders';
import { Order, OrderStatus } from '../types/order';
import { formatRupiah } from '../components/product/ProductCard';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight, AlertTriangle, CreditCard } from 'lucide-react';

export const OrdersPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [statusFilter, setStatusFilter] = useState<string>('ALL');

 const { data: orders = [], isLoading } = useQuery({
 queryKey: ['orders'],
 queryFn: fetchOrders,
 });

 const cancelMutation = useMutation({
 mutationFn: cancelOrder,
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
 });

 const filteredOrders = orders.filter((o) => {
 if (statusFilter === 'ALL') return true;
 return o.orderStatus === statusFilter;
 });

 const getStatusBadge = (status: OrderStatus) => {
 switch (status) {
 case 'PENDING_PAYMENT':
 return (
 <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center space-x-1">
 <Clock className="w-3 h-3" />
 <span>PENDING PAYMENT</span>
 </span>
 );
 case 'PAID':
 case 'COMPLETED':
 return (
 <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center space-x-1">
 <CheckCircle2 className="w-3 h-3" />
 <span>{status}</span>
 </span>
 );
 case 'CANCELLED':
 case 'PAYMENT_FAILED':
 case 'EXPIRED':
 return (
 <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center space-x-1">
 <XCircle className="w-3 h-3" />
 <span>{status}</span>
 </span>
 );
 default:
 return (
 <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
 {status}
 </span>
 );
 }
 };

 const handlePayNow = (order: Order) => {
 const snapToken = order.payment?.snapToken;
 if (window.snap && snapToken) {
 window.snap.pay(snapToken, {
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
 onPending: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
 onError: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
 onClose: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
 });
 }
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex items-center justify-between pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
 <ShoppingBag className="w-8 h-8 text-indigo-400" />
 <span>My Order History</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Track order status, view timeline progress, and manage payment settlements.
 </p>
 </div>
 </div>

 {/* Filter Status Tabs */}
 <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800/60">
 {['ALL', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(
 (status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
 statusFilter === status
 ? 'bg-indigo-600 text-white shadow-md'
 : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
 }`}
 >
 {status.replace('_', ' ')}
 </button>
 )
 )}
 </div>

 {/* Orders List */}
 {isLoading ? (
 <div className="text-center py-12 text-slate-500 text-xs">Loading orders...</div>
 ) : filteredOrders.length === 0 ? (
 <div className="min-h-[300px] flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-3">
 <ShoppingBag className="w-10 h-10 text-slate-600" />
 <h3 className="text-lg font-bold text-white">No orders found</h3>
 <p className="text-xs text-slate-400 max-w-sm">
 You don't have any orders matching the selected status filter.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {filteredOrders.map((order) => (
 <div
 key={order.id}
 className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-colors"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
 <div className="flex items-center space-x-3">
 <span className="font-mono font-bold text-sm text-indigo-400">
 {order.orderNumber}
 </span>
 <span className="text-[11px] text-slate-500">
 {new Date(order.createdAt).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 })}
 </span>
 </div>
 <div className="flex items-center space-x-3">
 {getStatusBadge(order.orderStatus)}
 </div>
 </div>

 {/* Items Preview */}
 <div className="space-y-2">
 {order.items.map((item) => (
 <div key={item.id} className="flex items-center justify-between text-xs">
 <span className="font-medium text-slate-200">
 {item.name} <span className="text-slate-500 font-mono">x{item.quantity}</span>
 </span>
 <span className="font-bold text-slate-300">{formatRupiah(item.subtotal)}</span>
 </div>
 ))}
 </div>

 {/* Footer Bar */}
 <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 <div>
 <p className="text-[11px] text-slate-400">Grand Total Amount</p>
 <p className="text-base font-extrabold text-white">{formatRupiah(order.grandTotal)}</p>
 </div>

 <div className="flex items-center space-x-3">
 {order.orderStatus === 'PENDING_PAYMENT' && (
 <>
 <button
 onClick={() => cancelMutation.mutate(order.id)}
 className="px-3 py-2 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={() => handlePayNow(order)}
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center space-x-1.5"
 >
 <CreditCard className="w-3.5 h-3.5" />
 <span>Pay Now</span>
 </button>
 </>
 )}
 <Link
 to={`/orders/${order.id}`}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"
 >
 <span>Details</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};
