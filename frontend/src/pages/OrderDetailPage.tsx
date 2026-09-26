import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderById } from '../api/orders';
import { formatRupiah } from '../components/product/ProductCard';
import {
 ShoppingBag,
 ArrowLeft,
 MapPin,
 Truck,
 CreditCard,
 CheckCircle2,
 Clock,
 ShieldCheck,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
 const { id } = useParams<{ id: string }>();

 const { data: order, isLoading, isError } = useQuery({
 queryKey: ['order', id],
 queryFn: () => fetchOrderById(id!),
 enabled: !!id,
 });

 if (isLoading) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 if (isError || !order) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
 <h2 className="text-2xl font-bold text-white">Order Not Found</h2>
 <Link to="/orders" className="text-indigo-400 font-semibold hover:underline">
 Return to Order History
 </Link>
 </div>
 );
 }

 const timelineSteps = [
 { label: 'Order Created', isDone: true },
 {
 label: 'Payment Confirmed',
 isDone: order.orderStatus !== 'PENDING_PAYMENT' && order.orderStatus !== 'CANCELLED',
 },
 {
 label: 'Processing',
 isDone: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus),
 },
 {
 label: 'Shipped',
 isDone: ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus),
 },
 {
 label: 'Delivered',
 isDone: ['DELIVERED', 'COMPLETED'].includes(order.orderStatus),
 },
 { label: 'Completed', isDone: order.orderStatus === 'COMPLETED' },
 ];

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Back Breadcrumb */}
 <Link
 to="/orders"
 className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>Back to My Orders</span>
 </Link>

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <div className="flex items-center space-x-3">
 <h1 className="text-2xl font-extrabold text-white font-mono">{order.orderNumber}</h1>
 <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase">
 {order.orderStatus}
 </span>
 </div>
 <p className="text-xs text-slate-400 mt-1">
 Placed on{' '}
 {new Date(order.createdAt).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })}
 </p>
 </div>
 </div>

 {/* Order Timeline Visualizer */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-sm font-bold text-white uppercase tracking-wider">Order Timeline Progress</h2>
 <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
 {timelineSteps.map((step, idx) => (
 <div
 key={idx}
 className={`p-3 rounded-xl border text-center transition-all ${
 step.isDone
 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
 : 'bg-slate-950/40 border-slate-800 text-slate-600'
 }`}
 >
 <div className="flex justify-center mb-1">
 {step.isDone ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-400" />
 ) : (
 <Clock className="w-4 h-4 text-slate-600" />
 )}
 </div>
 <p className="text-[11px] font-bold">{step.label}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Column: Items & Details */}
 <div className="lg:col-span-2 space-y-6">
 {/* Items */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
 <ShoppingBag className="w-5 h-5 text-indigo-400" />
 <span>Purchased Line Items</span>
 </h2>

 <div className="divide-y divide-slate-800">
 {order.items.map((item) => (
 <div key={item.id} className="py-3 flex items-center justify-between text-xs">
 <div className="space-y-1">
 <p className="font-bold text-white">{item.name}</p>
 <p className="text-[11px] text-slate-400">
 {item.quantity} x {formatRupiah(item.price)}
 </p>
 </div>
 <span className="font-extrabold text-indigo-400">{formatRupiah(item.subtotal)}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Delivery Address & Shipping info */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-xl">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
 <MapPin className="w-4 h-4 text-indigo-400" />
 <span>Shipping Address</span>
 </h3>
 <p className="font-bold text-sm text-white">{order.address?.recipientName}</p>
 <p className="text-xs text-slate-400 font-mono">{order.address?.phone}</p>
 <p className="text-xs text-slate-300">{order.address?.fullAddress}</p>
 <p className="text-xs text-slate-400">
 {order.address?.district}, {order.address?.city}, {order.address?.province}{' '}
 {order.address?.postalCode}
 </p>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-xl">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
 <Truck className="w-4 h-4 text-indigo-400" />
 <span>Courier & Logistics</span>
 </h3>
 <p className="font-bold text-sm text-white">
 {order.courier} - {order.courierService}
 </p>
 <div>
 <p className="text-[11px] text-slate-500">Tracking Number (AWB)</p>
 <p className="font-mono text-xs font-bold text-indigo-300">
 {order.trackingNumber || 'Pending Dispatch'}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column: Price Summary & Receipt */}
 <div className="space-y-6">
 <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
 <CreditCard className="w-5 h-5 text-indigo-400" />
 <span>Payment Receipt</span>
 </h2>

 <div className="space-y-2.5 text-xs">
 <div className="flex justify-between text-slate-400">
 <span>Items Subtotal</span>
 <span className="text-slate-200 font-bold">{formatRupiah(order.subtotal)}</span>
 </div>
 <div className="flex justify-between text-slate-400">
 <span>Shipping Cost</span>
 <span className="text-slate-200 font-bold">{formatRupiah(order.shippingCost)}</span>
 </div>
 <div className="flex justify-between text-slate-400">
 <span>Discount Amount</span>
 <span className="text-emerald-400 font-bold">-{formatRupiah(order.discountAmount)}</span>
 </div>
 <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
 <span>Grand Total</span>
 <span className="text-indigo-400">{formatRupiah(order.grandTotal)}</span>
 </div>
 </div>

 <div className="pt-4 border-t border-slate-800 text-xs space-y-1 text-slate-400">
 <p>
 Payment Status:{' '}
 <span className="font-bold text-slate-200">{order.paymentStatus}</span>
 </p>
 {order.payment?.paidAt && (
 <p>
 Paid At:{' '}
 <span className="font-mono text-slate-300">
 {new Date(order.payment.paidAt).toLocaleString('id-ID')}
 </span>
 </p>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
