import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardMetrics } from '../api/admin';
import {
 LayoutDashboard,
 Users,
 Package,
 ShoppingCart,
 DollarSign,
 ShieldCheck,
 AlertTriangle,
 ArrowRight,
 Boxes,
 TrendingUp,
} from 'lucide-react';

const formatRupiah = (amount: number) => {
 return new Intl.NumberFormat('id-ID', {
 style: 'currency',
 currency: 'IDR',
 maximumFractionDigits: 0,
 }).format(amount);
};

export const DashboardPage: React.FC = () => {
 const { user } = useAuth();

 const { data: metrics, isLoading } = useQuery({
 queryKey: ['adminDashboardMetrics'],
 queryFn: fetchDashboardMetrics,
 refetchInterval: 30000,
 });

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <LayoutDashboard className="w-6 h-6 text-indigo-400" />
 <span>Enterprise Admin Dashboard</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Operational control panel & real-time store metrics.
 </p>
 </div>

 <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
 <ShieldCheck className="w-4 h-4 text-emerald-400" />
 <div className="text-left">
 <p className="text-xs font-semibold text-slate-200">{user?.fullName}</p>
 <p className="text-[10px] text-slate-400 font-mono">{user?.role}</p>
 </div>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Total Revenue</span>
 <DollarSign className="w-4 h-4 text-emerald-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoading ? '...' : formatRupiah(metrics?.totalRevenue || 0)}
 </p>
 <span className="text-[10px] text-emerald-400 font-mono">Completed & Paid Orders</span>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Total Orders</span>
 <ShoppingCart className="w-4 h-4 text-indigo-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoading ? '...' : metrics?.totalOrders || 0}
 </p>
 <span className="text-[10px] text-indigo-400 font-mono">
 {metrics?.pendingOrdersCount || 0} pending payment
 </span>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Active Products</span>
 <Package className="w-4 h-4 text-violet-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoading ? '...' : metrics?.activeProductsCount || 0}
 </p>
 <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
 {metrics?.lowStockProductsCount ? (
 <>
 <AlertTriangle className="w-3 h-3" />
 {metrics.lowStockProductsCount} low stock alerts
 </>
 ) : (
 'Stock health optimal'
 )}
 </span>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Total Customers</span>
 <Users className="w-4 h-4 text-pink-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoading ? '...' : metrics?.totalCustomersCount || 0}
 </p>
 <span className="text-[10px] text-slate-400 font-mono">Registered buyer accounts</span>
 </div>
 </div>

 {/* Quick Navigation Cards */}
 <div className="space-y-4">
 <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
 Quick Operations & Portals
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <Link
 to="/admin/orders"
 className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group space-y-3"
 >
 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
 <ShoppingCart className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
 <span>Order Fulfillment</span>
 <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
 </h3>
 <p className="text-xs text-slate-400 mt-1">
 Manage order lifecycle, update statuses, and dispatch AWB shipping tracking numbers.
 </p>
 </div>
 </Link>

 <Link
 to="/admin/inventory"
 className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all group space-y-3"
 >
 <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
 <Boxes className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors flex items-center justify-between">
 <span>Inventory Synchronization</span>
 <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
 </h3>
 <p className="text-xs text-slate-400 mt-1">
 Monitor stock levels, reserved stock pool, low stock alerts, and manual stock movements.
 </p>
 </div>
 </Link>

 <Link
 to="/admin/analytics"
 className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group space-y-3"
 >
 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
 <TrendingUp className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
 <span>Business Intelligence & Analytics</span>
 <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
 </h3>
 <p className="text-xs text-slate-400 mt-1">
 View revenue trends, top selling product rankings, category breakdowns, and export sales CSV reports.
 </p>
 </div>
 </Link>
 </div>
 </div>
 </div>
 );
};

export default DashboardPage;
