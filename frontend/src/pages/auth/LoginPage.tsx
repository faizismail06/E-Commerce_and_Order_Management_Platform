import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import { ShoppingBag, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 const { login } = useAuth();
 const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setLoading(true);

 try {
 const response = await api.post('/auth/login', { email, password });
 if (response.data?.success) {
 const { token, user } = response.data.data;
 login(token, user);
 if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
 navigate('/admin/dashboard');
 } else {
 navigate('/');
 }
 }
 } catch (err: any) {
 const msg = err.response?.data?.error?.message || 'Login failed. Please verify credentials.';
 setError(msg);
 } finally {
 setLoading(false);
 }
 };

 const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
 setEmail(demoEmail);
 setPassword(demoPass);
 };

 return (
 <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full space-y-8 bg-slate-900/60 p-8 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl">
 <div className="text-center">
 <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
 <ShoppingBag className="w-6 h-6 text-white" />
 </div>
 <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Sign in to your account</h2>
 <p className="mt-1 text-xs text-slate-400">Welcome back to Nexus Order Platform</p>
 </div>

 {error && (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
 <AlertCircle className="w-4 h-4 flex-shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
 <Mail className="w-4 h-4" />
 </div>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
 placeholder="customer@platform.com"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
 <Lock className="w-4 h-4" />
 </div>
 <input
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
 placeholder="••••••••"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 group"
 >
 <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
 {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
 </button>
 </form>

 {/* Demo Credentials Shortcuts */}
 <div className="pt-4 border-t border-slate-800">
 <p className="text-[11px] font-mono text-slate-400 mb-2 text-center uppercase tracking-wider">Quick Fill Demo Accounts</p>
 <div className="grid grid-cols-3 gap-2">
 <button
 onClick={() => handleQuickDemoLogin('customer@platform.com', 'Customer123!')}
 className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] text-slate-300 transition-colors"
 >
 Customer
 </button>
 <button
 onClick={() => handleQuickDemoLogin('admin@platform.com', 'Admin123!')}
 className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] text-indigo-300 transition-colors"
 >
 Admin
 </button>
 <button
 onClick={() => handleQuickDemoLogin('superadmin@platform.com', 'SuperAdmin123!')}
 className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] text-emerald-300 transition-colors"
 >
 Super Admin
 </button>
 </div>
 </div>

 <div className="text-center text-xs text-slate-400">
 Don't have an account?{' '}
 <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
 Register here
 </Link>
 </div>
 </div>
 </div>
 );
};
