import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCustomers, toggleCustomerStatus } from '../../api/admin';
import {
 Users,
 Search,
 CheckCircle,
 XCircle,
 ShoppingBag,
 DollarSign,
 UserCheck,
 UserX,
 ShieldAlert,
} from 'lucide-react';

const formatRupiah = (amount: number) => {
 return new Intl.NumberFormat('id-ID', {
 style: 'currency',
 currency: 'IDR',
 maximumFractionDigits: 0,
 }).format(amount);
};

export const AdminCustomersPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [search, setSearch] = useState('');

 const { data: customers = [], isLoading } = useQuery({
 queryKey: ['adminCustomers', search],
 queryFn: () => fetchCustomers(search),
 });

 const toggleStatusMutation = useMutation({
 mutationFn: (customerId: string) => toggleCustomerStatus(customerId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
 queryClient.invalidateQueries({ queryKey: ['adminDashboardMetrics'] });
 },
 });

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <Users className="w-6 h-6 text-pink-400" />
 <span>Customer Directory & Account Management</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Monitor registered buyer profiles, total order history spending, and control account active statuses.
 </p>
 </div>
 </div>

 {/* Toolbar Search */}
 <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
 <div className="relative w-full sm:w-80">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search by name, email, phone..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
 />
 </div>
 </div>

 {/* Customer List Table */}
 <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 text-xs">Loading customer directory...</div>
 ) : customers.length === 0 ? (
 <div className="p-12 text-center text-slate-400 text-xs space-y-2">
 <Users className="w-8 h-8 text-slate-600 mx-auto" />
 <p>No customer accounts found.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
 <th className="p-4">Customer Info</th>
 <th className="p-4">Contact</th>
 <th className="p-4">Orders Placed</th>
 <th className="p-4">Lifetime Spend</th>
 <th className="p-4">Registered Date</th>
 <th className="p-4">Account Status</th>
 <th className="p-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {customers.map((c) => (
 <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
 {/* Customer Info */}
 <td className="p-4 font-semibold text-slate-100">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
 {c.fullName.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="text-slate-200 font-semibold">{c.fullName}</p>
 <p className="text-[10px] text-slate-500 font-mono">ID: {c.id.substring(0, 8)}</p>
 </div>
 </div>
 </td>

 {/* Contact */}
 <td className="p-4">
 <p className="text-slate-300 font-mono">{c.email}</p>
 <p className="text-[10px] text-slate-500 font-mono">{c.phone || 'No phone'}</p>
 </td>

 {/* Orders */}
 <td className="p-4">
 <span className="inline-flex items-center space-x-1 font-semibold text-slate-300">
 <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
 <span>{c.totalOrders} orders</span>
 </span>
 </td>

 {/* Lifetime Spend */}
 <td className="p-4 font-bold text-emerald-400">
 {formatRupiah(c.totalSpending)}
 </td>

 {/* Registered Date */}
 <td className="p-4 text-slate-400 text-[11px]">
 {new Date(c.createdAt).toLocaleDateString('id-ID', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 })}
 </td>

 {/* Status Badge */}
 <td className="p-4">
 {c.isActive ? (
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
 <CheckCircle className="w-3 h-3" />
 <span>Active</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
 <XCircle className="w-3 h-3" />
 <span>Deactivated</span>
 </span>
 )}
 </td>

 {/* Action Toggle */}
 <td className="p-4 text-right">
 <button
 onClick={() => toggleStatusMutation.mutate(c.id)}
 disabled={toggleStatusMutation.isPending}
 className={`px-3 py-1.5 rounded-xl font-medium text-[11px] transition-colors inline-flex items-center space-x-1 ${
 c.isActive
 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
 : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
 }`}
 >
 {c.isActive ? (
 <>
 <UserX className="w-3.5 h-3.5" />
 <span>Deactivate</span>
 </>
 ) : (
 <>
 <UserCheck className="w-3.5 h-3.5" />
 <span>Activate</span>
 </>
 )}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
};

export default AdminCustomersPage;
