import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
 return (
 <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 mt-auto text-slate-400 text-xs">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-900">
 {/* Column 1: Brand & Tagline */}
 <div className="space-y-3 md:col-span-1">
 <Link to="/" className="flex items-center space-x-2 group">
 <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
 <ShoppingBag className="w-4 h-4 text-white" />
 </div>
 <span className="font-extrabold text-lg text-white tracking-tight">
 NEXUS STORE
 </span>
 </Link>
 <p className="text-slate-500 text-[11px] leading-relaxed">
 Full-Stack E-Commerce & Order Management Portfolio Platform with real-time stock concurrency and Midtrans payment processing.
 </p>
 </div>

 {/* Column 2: Navigation Links */}
 <div className="space-y-2">
 <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Store Navigation</h4>
 <ul className="space-y-1.5 text-[11px]">
 <li>
 <Link to="/catalog" className="hover:text-white transition-colors">
 Product Catalog
 </Link>
 </li>
 <li>
 <Link to="/cart" className="hover:text-white transition-colors">
 Shopping Cart
 </Link>
 </li>
 <li>
 <Link to="/orders" className="hover:text-white transition-colors">
 My Orders History
 </Link>
 </li>
 <li>
 <Link to="/addresses" className="hover:text-white transition-colors">
 Address Book
 </Link>
 </li>
 </ul>
 </div>

 {/* Column 3: Admin Console Links */}
 <div className="space-y-2">
 <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Management Portals</h4>
 <ul className="space-y-1.5 text-[11px]">
 <li>
 <Link to="/admin/dashboard" className="hover:text-indigo-400 transition-colors">
 Executive Dashboard
 </Link>
 </li>
 <li>
 <Link to="/admin/analytics" className="hover:text-indigo-400 transition-colors">
 BI Analytics & Reports
 </Link>
 </li>
 <li>
 <Link to="/admin/orders" className="hover:text-indigo-400 transition-colors">
 Order Fulfillment
 </Link>
 </li>
 <li>
 <Link to="/admin/inventory" className="hover:text-indigo-400 transition-colors">
 Inventory Synchronization
 </Link>
 </li>
 </ul>
 </div>

 {/* Column 4: Payment Badges & Security */}
 <div className="space-y-3">
 <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Payment & Security</h4>
 <div className="flex flex-wrap gap-2 text-[10px] font-mono">
 <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
 Midtrans Snap
 </span>
 <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
 QRIS
 </span>
 <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
 Bank Transfer
 </span>
 <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
 Visa / Mastercard
 </span>
 </div>
 <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
 <Lock className="w-3 h-3" /> HMAC SHA-512 Encrypted Webhook
 </p>
 </div>
 </div>

 {/* Bottom Credits & Tech Stack */}
 <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
 <p className="font-mono">
 NEXUS E-Commerce &copy; {new Date().getFullYear()} — Built for Senior Full-Stack Portfolio
 </p>

 <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
 <Cpu className="w-3.5 h-3.5 text-indigo-400" />
 <span>React 18 + Node.js + Express + PostgreSQL + Prisma ORM</span>
 </div>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
