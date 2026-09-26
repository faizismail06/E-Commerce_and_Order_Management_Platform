import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
 return (
 <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 text-center">
 <div className="max-w-md w-full bg-slate-900/60 p-8 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
 <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
 <ShieldAlert className="w-8 h-8" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-white">403 Access Denied</h2>
 <p className="mt-2 text-xs text-slate-400">
 You do not possess the administrative role permissions required to access this resource.
 </p>
 </div>
 <Link
 to="/"
 className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>Return to Storefront</span>
 </Link>
 </div>
 </div>
 );
};
