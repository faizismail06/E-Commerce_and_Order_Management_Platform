import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminOrders, updateOrderStatus, shipOrder, ShipOrderPayload } from '../../api/admin';
import {
 ShoppingCart,
 Search,
 Filter,
 Truck,
 Eye,
 CheckCircle2,
 XCircle,
 Clock,
 Package,
 X,
 AlertCircle,
} from 'lucide-react';

const formatRupiah = (amount: number) => {
 return new Intl.NumberFormat('id-ID', {
 style: 'currency',
 currency: 'IDR',
 maximumFractionDigits: 0,
 }).format(amount);
};

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
 PENDING_PAYMENT: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
 PAID: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
 PROCESSING: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
 SHIPPED: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
 DELIVERED: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
 COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
 CANCELLED: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
 EXPIRED: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const AdminOrdersPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('ALL');
 const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
 const [shippingModalOrder, setShippingModalOrder] = useState<any | null>(null);

 // Form state for shipping dispatch modal
 const [courier, setCourier] = useState('JNE');
 const [courierService, setCourierService] = useState('REG');
 const [trackingNumber, setTrackingNumber] = useState('');
 const [formError, setFormError] = useState('');

 const { data, isLoading } = useQuery({
 queryKey: ['adminOrders', statusFilter, search],
 queryFn: () => fetchAdminOrders({ status: statusFilter, search }),
 });

 const updateStatusMutation = useMutation({
 mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
 updateOrderStatus(orderId, status),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
 queryClient.invalidateQueries({ queryKey: ['adminDashboardMetrics'] });
 },
 });

 const shipOrderMutation = useMutation({
 mutationFn: ({ orderId, payload }: { orderId: string; payload: ShipOrderPayload }) =>
 shipOrder(orderId, payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
 queryClient.invalidateQueries({ queryKey: ['adminDashboardMetrics'] });
 setShippingModalOrder(null);
 setTrackingNumber('');
 setFormError('');
 },
 onError: (err: any) => {
 setFormError(err?.response?.data?.error?.message || 'Failed to dispatch order');
 },
 });

 const handleDispatchSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!trackingNumber.trim()) {
 setFormError('Tracking AWB Number is required');
 return;
 }
 if (!shippingModalOrder) return;

 shipOrderMutation.mutate({
 orderId: shippingModalOrder.id,
 payload: {
 courier,
 courierService,
 trackingNumber: trackingNumber.trim(),
 },
 });
 };

 const orders = data?.data || [];

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <ShoppingCart className="w-6 h-6 text-indigo-400" />
 <span>Order Fulfillment Management</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Process incoming orders, change fulfillment statuses, and dispatch tracking numbers.
 </p>
 </div>
 </div>

 {/* Filters Toolbar */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
 {/* Search */}
 <div className="relative w-full sm:w-80">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search Order #, customer..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
 />
 </div>

 {/* Status Filter */}
 <div className="flex items-center space-x-2 w-full sm:w-auto">
 <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
 >
 <option value="ALL">All Statuses</option>
 <option value="PENDING_PAYMENT">Pending Payment</option>
 <option value="PAID">Paid</option>
 <option value="PROCESSING">Processing</option>
 <option value="SHIPPED">Shipped</option>
 <option value="DELIVERED">Delivered</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 <option value="EXPIRED">Expired</option>
 </select>
 </div>
 </div>

 {/* Orders Table */}
 <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 text-xs">Loading admin orders...</div>
 ) : orders.length === 0 ? (
 <div className="p-12 text-center text-slate-400 text-xs space-y-2">
 <Package className="w-8 h-8 text-slate-600 mx-auto" />
 <p>No orders found matching your criteria.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
 <th className="p-4">Order Info</th>
 <th className="p-4">Customer</th>
 <th className="p-4">Total</th>
 <th className="p-4">Status</th>
 <th className="p-4">Shipping Info</th>
 <th className="p-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {orders.map((ord: any) => {
 const badge = STATUS_BADGES[ord.orderStatus] || STATUS_BADGES.PENDING_PAYMENT;
 return (
 <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
 {/* Order Info */}
 <td className="p-4">
 <p className="font-mono font-bold text-indigo-400">{ord.orderNumber}</p>
 <p className="text-[10px] text-slate-500 mt-0.5">
 {new Date(ord.createdAt).toLocaleString('id-ID')}
 </p>
 </td>

 {/* Customer */}
 <td className="p-4">
 <p className="font-semibold text-slate-200">{ord.user?.fullName}</p>
 <p className="text-[10px] text-slate-400 font-mono">{ord.user?.email}</p>
 </td>

 {/* Total */}
 <td className="p-4 font-bold text-slate-100">
 {formatRupiah(Number(ord.grandTotal))}
 </td>

 {/* Status */}
 <td className="p-4">
 <span
 className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
 >
 {ord.orderStatus}
 </span>
 </td>

 {/* Shipping Info */}
 <td className="p-4 text-[11px]">
 {ord.trackingNumber ? (
 <div>
 <p className="font-semibold text-slate-300">
 {ord.courier} - {ord.courierService}
 </p>
 <p className="font-mono text-indigo-400">AWB: {ord.trackingNumber}</p>
 </div>
 ) : (
 <span className="text-slate-500 italic">Not dispatched</span>
 )}
 </td>

 {/* Actions */}
 <td className="p-4 text-right space-x-2">
 {/* View Detail */}
 <button
 onClick={() => setSelectedOrder(ord)}
 className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
 title="View Detail"
 >
 <Eye className="w-4 h-4" />
 </button>

 {/* Dispatch Shipping button (Available for PAID / PROCESSING) */}
 {(ord.orderStatus === 'PAID' || ord.orderStatus === 'PROCESSING') && (
 <button
 onClick={() => {
 setShippingModalOrder(ord);
 setTrackingNumber('');
 setFormError('');
 }}
 className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] inline-flex items-center space-x-1 transition-colors"
 >
 <Truck className="w-3.5 h-3.5" />
 <span>Ship</span>
 </button>
 )}

 {/* Quick Status Update Selector */}
 <select
 value={ord.orderStatus}
 onChange={(e) =>
 updateStatusMutation.mutate({
 orderId: ord.id,
 status: e.target.value,
 })
 }
 className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
 >
 <option value="PENDING_PAYMENT" disabled>
 Pending Payment
 </option>
 <option value="PAID">Paid</option>
 <option value="PROCESSING">Processing</option>
 <option value="SHIPPED">Shipped</option>
 <option value="DELIVERED">Delivered</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 </select>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* View Detail Modal */}
 {selectedOrder && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
 <div className="flex items-center justify-between pb-4 border-b border-slate-800">
 <div>
 <h3 className="font-bold text-white text-lg flex items-center space-x-2">
 <span>Order {selectedOrder.orderNumber}</span>
 </h3>
 <p className="text-xs text-slate-400 mt-1">
 Placed on {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
 </p>
 </div>
 <button
 onClick={() => setSelectedOrder(null)}
 className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Recipient & Address */}
 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
 <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
 Delivery Recipient
 </h4>
 <p className="font-semibold text-white">{selectedOrder.address?.recipientName}</p>
 <p className="text-xs text-slate-300">{selectedOrder.address?.fullAddress}</p>
 <p className="text-xs text-slate-400">
 {selectedOrder.address?.city}, {selectedOrder.address?.province}{' '}
 {selectedOrder.address?.postalCode} | Phone: {selectedOrder.address?.phone}
 </p>
 </div>

 {/* Order Items Table */}
 <div className="space-y-3">
 <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
 Purchased Items ({selectedOrder.items?.length})
 </h4>
 <div className="space-y-2">
 {selectedOrder.items?.map((item: any) => (
 <div
 key={item.id}
 className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/60"
 >
 <div>
 <p className="font-semibold text-slate-200 text-xs">{item.productName}</p>
 <p className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</p>
 </div>
 <div className="text-right text-xs">
 <p className="text-slate-300 font-mono">
 {item.quantity} x {formatRupiah(Number(item.price))}
 </p>
 <p className="font-bold text-white">
 {formatRupiah(Number(item.subtotal))}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Financial Summary */}
 <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
 <div className="flex justify-between text-slate-400">
 <span>Subtotal</span>
 <span>{formatRupiah(Number(selectedOrder.subtotal))}</span>
 </div>
 <div className="flex justify-between text-slate-400">
 <span>Shipping Fee</span>
 <span>{formatRupiah(Number(selectedOrder.shippingFee))}</span>
 </div>
 <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
 <span>Grand Total</span>
 <span className="text-indigo-400">
 {formatRupiah(Number(selectedOrder.grandTotal))}
 </span>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Dispatch Shipping Modal */}
 {shippingModalOrder && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
 <form
 onSubmit={handleDispatchSubmit}
 className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6"
 >
 <div className="flex items-center justify-between pb-4 border-b border-slate-800">
 <div>
 <h3 className="font-bold text-white text-base flex items-center space-x-2">
 <Truck className="w-5 h-5 text-indigo-400" />
 <span>Dispatch Shipping (AWB)</span>
 </h3>
 <p className="text-xs text-slate-400 mt-1">
 Order {shippingModalOrder.orderNumber}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setShippingModalOrder(null)}
 className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {formError && (
 <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{formError}</span>
 </div>
 )}

 <div className="space-y-4 text-xs">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Shipping Courier</label>
 <select
 value={courier}
 onChange={(e) => setCourier(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
 >
 <option value="JNE">JNE Express</option>
 <option value="TIKI">TIKI Courier</option>
 <option value="POS">POS Indonesia</option>
 <option value="SiCepat">SiCepat Express</option>
 <option value="J&T">J&T Express</option>
 </select>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Courier Service</label>
 <input
 type="text"
 placeholder="e.g. REG, YES, OKE"
 value={courierService}
 onChange={(e) => setCourierService(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Tracking Number (AWB)</label>
 <input
 type="text"
 placeholder="e.g. JNE-998811223344"
 value={trackingNumber}
 onChange={(e) => setTrackingNumber(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
 />
 </div>
 </div>

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
 <button
 type="button"
 onClick={() => setShippingModalOrder(null)}
 className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={shipOrderMutation.isPending}
 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
 >
 {shipOrderMutation.isPending ? 'Dispatching...' : 'Confirm Shipping'}
 </button>
 </div>
 </form>
 </div>
 )}
 </div>
 );
};

export default AdminOrdersPage;
