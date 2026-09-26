import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
 fetchAnalyticsOverview,
 fetchTopSellingProducts,
 fetchCategoryDistribution,
 downloadSalesReportCSV,
} from '../../api/analytics';
import {
 AreaChart,
 Area,
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Legend,
} from 'recharts';
import {
 TrendingUp,
 DollarSign,
 ShoppingCart,
 Award,
 Download,
 Calendar,
 PieChart as PieChartIcon,
 BarChart3,
 Tag,
} from 'lucide-react';

const formatRupiah = (amount: number) => {
 return new Intl.NumberFormat('id-ID', {
 style: 'currency',
 currency: 'IDR',
 maximumFractionDigits: 0,
 }).format(amount);
};

const PIE_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6', '#8b5cf6'];

export const AdminAnalyticsPage: React.FC = () => {
 const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('30d');
 const [isExporting, setIsExporting] = useState(false);

 // Overview Data
 const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
 queryKey: ['analyticsOverview', period],
 queryFn: () => fetchAnalyticsOverview(period),
 });

 // Top Products
 const { data: topProducts = [], isLoading: isLoadingTopProducts } = useQuery({
 queryKey: ['topProductsAnalytics'],
 queryFn: () => fetchTopSellingProducts(5),
 });

 // Category Distribution
 const { data: categoryData = [], isLoading: isLoadingCategories } = useQuery({
 queryKey: ['categoryAnalytics'],
 queryFn: fetchCategoryDistribution,
 });

 const handleExportCSV = async () => {
 try {
 setIsExporting(true);
 await downloadSalesReportCSV();
 } catch (err) {
 console.error('Export CSV failed:', err);
 } finally {
 setIsExporting(false);
 }
 };

 const summary = overviewData?.summary || {
 totalRevenue: 0,
 totalOrders: 0,
 averageOrderValue: 0,
 totalDiscountGiven: 0,
 };

 const chartData = overviewData?.chartData || [];

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <TrendingUp className="w-6 h-6 text-indigo-400" />
 <span>Business Intelligence & Analytics</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Real-time financial metrics, sales trends, product rankings, and downloadable reports.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3">
 {/* Time Range Filter */}
 <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
 <button
 onClick={() => setPeriod('7d')}
 className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
 period === '7d' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
 }`}
 >
 7 Days
 </button>
 <button
 onClick={() => setPeriod('30d')}
 className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
 period === '30d' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
 }`}
 >
 30 Days
 </button>
 <button
 onClick={() => setPeriod('12m')}
 className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
 period === '12m' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
 }`}
 >
 1 Year
 </button>
 </div>

 {/* Export CSV Button */}
 <button
 onClick={handleExportCSV}
 disabled={isExporting}
 className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
 >
 <Download className="w-4 h-4 text-emerald-400" />
 <span>{isExporting ? 'Generating CSV...' : 'Export Sales CSV'}</span>
 </button>
 </div>
 </div>

 {/* Summary KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 shadow-xl">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Total Revenue</span>
 <DollarSign className="w-4 h-4 text-emerald-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoadingOverview ? '...' : formatRupiah(summary.totalRevenue)}
 </p>
 <span className="text-[10px] text-emerald-400 font-mono">Paid & completed sales</span>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 shadow-xl">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Total Completed Orders</span>
 <ShoppingCart className="w-4 h-4 text-indigo-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoadingOverview ? '...' : summary.totalOrders}
 </p>
 <span className="text-[10px] text-indigo-400 font-mono">Fulfilled transactions</span>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 shadow-xl">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Average Order Value (AOV)</span>
 <Award className="w-4 h-4 text-violet-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoadingOverview ? '...' : formatRupiah(summary.averageOrderValue)}
 </p>
 <span className="text-[10px] text-violet-400 font-mono">Mean revenue per transaction</span>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 shadow-xl">
 <div className="flex items-center justify-between text-slate-400 text-xs">
 <span>Discounts Given</span>
 <Tag className="w-4 h-4 text-pink-400" />
 </div>
 <p className="text-2xl font-extrabold text-white">
 {isLoadingOverview ? '...' : formatRupiah(summary.totalDiscountGiven)}
 </p>
 <span className="text-[10px] text-pink-400 font-mono">Promo coupon savings</span>
 </div>
 </div>

 {/* Main Revenue Trend Chart */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-base font-bold text-white flex items-center space-x-2">
 <Calendar className="w-5 h-5 text-indigo-400" />
 <span>Revenue & Order Volume Trend</span>
 </h2>
 <p className="text-xs text-slate-400 mt-0.5">
 Sales performance over time for the selected period ({period}).
 </p>
 </div>
 </div>

 <div className="h-72 w-full">
 {chartData.length === 0 ? (
 <div className="h-full flex items-center justify-center text-xs text-slate-500">
 No sales transaction data recorded for this time range.
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
 <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
 <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `Rp ${val / 1000}k`} />
 <Tooltip
 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
 labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
 formatter={(value: any) => [formatRupiah(Number(value)), 'Revenue']}
 />
 <Area
 type="monotone"
 dataKey="revenue"
 stroke="#6366f1"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorRevenue)"
 />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>

 {/* Grid: Top Products Bar Chart & Category Pie Chart */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Top 5 Best-Selling Products */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
 <BarChart3 className="w-5 h-5 text-violet-400" />
 <span>Top 5 Best-Selling Products</span>
 </h2>

 <div className="h-64 w-full">
 {topProducts.length === 0 ? (
 <div className="h-full flex items-center justify-center text-xs text-slate-500">
 No product sales records.
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
 <XAxis type="number" stroke="#64748b" fontSize={11} />
 <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} />
 <Tooltip
 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
 formatter={(val: any, name: string) =>
 name === 'totalQuantitySold'
 ? [`${val} Units Sold`, 'Volume']
 : [formatRupiah(Number(val)), 'Revenue']
 }
 />
 <Bar dataKey="totalQuantitySold" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>

 {/* Category Sales Distribution */}
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
 <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
 <PieChartIcon className="w-5 h-5 text-pink-400" />
 <span>Category Revenue Distribution</span>
 </h2>

 <div className="h-64 w-full">
 {categoryData.length === 0 ? (
 <div className="h-full flex items-center justify-center text-xs text-slate-500">
 No category sales records.
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={categoryData}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={85}
 paddingAngle={4}
 dataKey="totalRevenue"
 >
 {categoryData.map((_, index) => (
 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
 formatter={(value: any) => [formatRupiah(Number(value)), 'Revenue']}
 />
 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
 </PieChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default AdminAnalyticsPage;
