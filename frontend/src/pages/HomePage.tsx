import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
 ShoppingBag,
 Sparkles,
 ShieldCheck,
 Zap,
 ArrowRight,
 Tag,
 Boxes,
 TrendingUp,
 Award,
 Star,
 Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
 const { user, isAuthenticated } = useAuth();

 return (
 <div className="space-y-16 pb-16">
 {/* Hero Section with Glassmorphism Accent */}
 <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
 <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-slate-950 to-violet-950/30 -z-10" />
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

 <div className="max-w-5xl mx-auto text-center space-y-8">
 {/* Badge Ticker */}
 <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-indigo-400 text-xs font-semibold shadow-lg backdrop-blur-md">
 <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
 <span>Full-Stack Enterprise E-Commerce & Order Management Engine</span>
 </div>

 <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
 Next-Generation <br />
 <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
 Digital Storefront & Operations
 </span>
 </h1>

 <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
 Experience production-grade e-commerce featuring dynamic product catalog, real-time inventory synchronization, Midtrans Snap payment gateway, and executive Business Intelligence.
 </p>

 <div className="flex flex-wrap justify-center gap-4 pt-2">
 <Link
 to="/catalog"
 className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
 >
 <ShoppingBag className="w-4 h-4" />
 <span>Explore Product Catalog</span>
 <ArrowRight className="w-4 h-4" />
 </Link>

 {!isAuthenticated ? (
 <Link
 to="/register"
 className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-2xl border border-slate-800 transition-all hover:scale-105"
 >
 Create Account
 </Link>
 ) : user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
 <Link
 to="/admin/dashboard"
 className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-2xl border border-slate-800 transition-all hover:scale-105"
 >
 Admin Console
 </Link>
 ) : (
 <Link
 to="/orders"
 className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-2xl border border-slate-800 transition-all hover:scale-105"
 >
 View My Orders
 </Link>
 )}
 </div>
 </div>
 </section>

 {/* Promotional Vouchers Live Banner Ticker */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
 <div className="flex items-center space-x-4">
 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
 <Tag className="w-6 h-6" />
 </div>
 <div>
 <h3 className="font-extrabold text-white text-base">Active Store Vouchers Available</h3>
 <p className="text-xs text-slate-400 mt-0.5">Use these codes at checkout for instant discounts.</p>
 </div>
 </div>

 <div className="flex flex-wrap gap-3">
 <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center space-x-2">
 <span className="font-mono font-bold text-emerald-400">WELCOME10</span>
 <span className="text-[10px] text-slate-400">(10% Off)</span>
 </div>
 <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center space-x-2">
 <span className="font-mono font-bold text-indigo-400">BIGSALE50</span>
 <span className="text-[10px] text-slate-400">(Rp 50k Off)</span>
 </div>
 <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center space-x-2">
 <span className="font-mono font-bold text-violet-400">SUPERVIP</span>
 <span className="text-[10px] text-slate-400">(20% Off)</span>
 </div>
 </div>
 </div>
 </section>

 {/* Feature Highlights Grid */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
 <div className="text-center space-y-2">
 <h2 className="text-2xl font-bold text-white">Production Business Logic Features</h2>
 <p className="text-xs text-slate-400 max-w-lg mx-auto">
 Architected to solve real-world e-commerce challenges with strict data integrity.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3 hover:border-indigo-500/50 transition-all group">
 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
 RBAC Security
 </h3>
 <p className="text-xs text-slate-400 leading-relaxed">
 Stateless JWT authentication with bcrypt password hashing and granular authorization roles.
 </p>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3 hover:border-emerald-500/50 transition-all group">
 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
 <Boxes className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
 Stock Concurrency
 </h3>
 <p className="text-xs text-slate-400 leading-relaxed">
 Prisma transactional stock reservation and auto-releasing expired order scanner.
 </p>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3 hover:border-violet-500/50 transition-all group">
 <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
 <Zap className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
 Midtrans Gateway
 </h3>
 <p className="text-xs text-slate-400 leading-relaxed">
 Snap popup payment flow verified with HMAC SHA-512 webhook signature verification.
 </p>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3 hover:border-pink-500/50 transition-all group">
 <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
 <TrendingUp className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
 Business Intelligence
 </h3>
 <p className="text-xs text-slate-400 leading-relaxed">
 Interactive Recharts analytics dashboard and exportable CSV sales reports.
 </p>
 </div>
 </div>
 </section>

 {/* Customer Trust Badges Banner */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center">
 <div className="flex flex-col items-center space-y-2">
 <Truck className="w-8 h-8 text-indigo-400" />
 <h4 className="font-bold text-white text-sm">Express Nationwide Shipping</h4>
 <p className="text-xs text-slate-400">Integrated weight fee calculations for JNE, TIKI, SiCepat.</p>
 </div>
 <div className="flex flex-col items-center space-y-2">
 <Star className="w-8 h-8 text-amber-400" />
 <h4 className="font-bold text-white text-sm">100% Verified Buyer Reviews</h4>
 <p className="text-xs text-slate-400">Only customers with completed orders can submit ratings.</p>
 </div>
 <div className="flex flex-col items-center space-y-2">
 <Award className="w-8 h-8 text-emerald-400" />
 <h4 className="font-bold text-white text-sm">Guaranteed Product Authenticity</h4>
 <p className="text-xs text-slate-400">Curated catalog items sourced directly from authorized vendors.</p>
 </div>
 </div>
 </section>
 </div>
 );
};

export default HomePage;
