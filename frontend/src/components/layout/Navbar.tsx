import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, Shield, Package, MapPin, Receipt, Boxes, ShoppingCart, Tag, TrendingUp } from 'lucide-react';

export const Navbar: React.FC = () => {
 const { user, isAuthenticated, logout } = useAuth();
 const { cart, setIsDrawerOpen } = useCart();
 const navigate = useNavigate();

 const handleLogout = () => {
 logout();
 navigate('/login');
 };

 const totalCartItems = cart?.totalItems || 0;

 return (
 <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <Link to="/" className="flex items-center space-x-3 group">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
 <ShoppingBag className="w-5 h-5 text-white" />
 </div>
 <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
 NEXUS STORE
 </span>
 </Link>

 {/* Navigation Items */}
 <div className="flex items-center space-x-4">
 <Link
 to="/catalog"
 className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
 >
 Product Catalog
 </Link>

 {isAuthenticated && (
 <>
 <Link
 to="/addresses"
 className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/50"
 >
 <MapPin className="w-3.5 h-3.5 text-indigo-400" />
 <span>Addresses</span>
 </Link>
 <Link
 to="/orders"
 className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/50"
 >
 <Receipt className="w-3.5 h-3.5 text-emerald-400" />
 <span>My Orders</span>
 </Link>
 </>
 )}

 {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
 <div className="flex items-center space-x-2">
 <Link
 to="/admin/analytics"
 className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50"
 >
 <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
 <span>Analytics</span>
 </Link>
 <Link
 to="/admin/promotions"
 className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50"
 >
 <Tag className="w-3.5 h-3.5 text-emerald-400" />
 <span>Coupons</span>
 </Link>
 <Link
 to="/admin/orders"
 className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50"
 >
 <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
 <span>Orders</span>
 </Link>
 <Link
 to="/admin/inventory"
 className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50"
 >
 <Boxes className="w-3.5 h-3.5 text-amber-400" />
 <span>Inventory</span>
 </Link>
 <Link
 to="/admin/products"
 className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50"
 >
 <Package className="w-3.5 h-3.5 text-violet-400" />
 <span>Products</span>
 </Link>
 <Link
 to="/admin/dashboard"
 className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
 >
 <LayoutDashboard className="w-3.5 h-3.5" />
 <span>Dashboard</span>
 </Link>
 </div>
 )}

 {/* Cart Trigger Button */}
 <button
 onClick={() => setIsDrawerOpen(true)}
 className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-all hover:scale-105"
 title="Shopping Cart"
 >
 <ShoppingBag className="w-4 h-4 text-indigo-400" />
 {totalCartItems > 0 && (
 <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
 {totalCartItems}
 </span>
 )}
 </button>

 {isAuthenticated ? (
 <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
 <div className="flex items-center space-x-2">
 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
 {user?.role === 'SUPER_ADMIN' ? (
 <Shield className="w-4 h-4 text-emerald-400" />
 ) : (
 <UserIcon className="w-4 h-4" />
 )}
 </div>
 <div className="hidden md:block text-left">
 <p className="text-xs font-semibold text-slate-200">{user?.fullName}</p>
 <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role.toLowerCase()}</p>
 </div>
 </div>

 <button
 onClick={handleLogout}
 className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
 title="Logout"
 >
 <LogOut className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
 <Link
 to="/login"
 className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
 >
 Sign In
 </Link>
 <Link
 to="/register"
 className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
 >
 Register
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 </nav>
 );
};
