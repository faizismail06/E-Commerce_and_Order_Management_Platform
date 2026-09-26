import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminPromotions, createPromotion, togglePromotionStatus } from '../../api/promotions';
import {
 Tag,
 Plus,
 CheckCircle,
 XCircle,
 Clock,
 Percent,
 DollarSign,
 AlertCircle,
 X,
 Layers,
} from 'lucide-react';

const formatRupiah = (amount: number) => {
 return new Intl.NumberFormat('id-ID', {
 style: 'currency',
 currency: 'IDR',
 maximumFractionDigits: 0,
 }).format(amount);
};

export const AdminPromotionsPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [formError, setFormError] = useState('');

 // New Promo Form State
 const [code, setCode] = useState('');
 const [name, setName] = useState('');
 const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
 const [value, setValue] = useState<number>(10);
 const [minPurchase, setMinPurchase] = useState<number>(100000);
 const [maxDiscount, setMaxDiscount] = useState<number | undefined>(50000);
 const [usageLimit, setUsageLimit] = useState<number>(100);

 const { data: promotions = [], isLoading } = useQuery({
 queryKey: ['adminPromotions'],
 queryFn: fetchAdminPromotions,
 });

 const createMutation = useMutation({
 mutationFn: createPromotion,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
 setIsModalOpen(false);
 setCode('');
 setName('');
 setFormError('');
 },
 onError: (err: any) => {
 setFormError(err.response?.data?.error?.message || 'Failed to create promotion');
 },
 });

 const toggleMutation = useMutation({
 mutationFn: togglePromotionStatus,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
 },
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setFormError('');
 if (!code.trim() || !name.trim()) {
 setFormError('Code and Name are required fields');
 return;
 }

 createMutation.mutate({
 code: code.trim().toUpperCase(),
 name: name.trim(),
 type,
 value: Number(value),
 minPurchase: Number(minPurchase),
 maxDiscount: maxDiscount ? Number(maxDiscount) : null,
 usageLimit: Number(usageLimit),
 startDate: new Date().toISOString(),
 endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
 isActive: true,
 });
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <Tag className="w-6 h-6 text-emerald-400" />
 <span>Promotion & Voucher Management</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Create discount coupon codes, set usage limits, minimum purchases, and control active campaigns.
 </p>
 </div>

 <button
 onClick={() => {
 setIsModalOpen(true);
 setFormError('');
 }}
 className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all self-start md:self-auto"
 >
 <Plus className="w-4 h-4" />
 <span>Create New Coupon</span>
 </button>
 </div>

 {/* Promotions List Table */}
 <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
 {isLoading ? (
 <div className="p-12 text-center text-slate-400 text-xs">Loading promotions list...</div>
 ) : promotions.length === 0 ? (
 <div className="p-12 text-center text-slate-400 text-xs space-y-2">
 <Tag className="w-8 h-8 text-slate-600 mx-auto" />
 <p>No active promotions or coupons found.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
 <th className="p-4">Coupon Code</th>
 <th className="p-4">Type & Value</th>
 <th className="p-4">Min. Purchase</th>
 <th className="p-4">Usage Count</th>
 <th className="p-4">Status</th>
 <th className="p-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60">
 {promotions.map((p) => (
 <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
 {/* Code */}
 <td className="p-4">
 <p className="font-mono font-bold text-emerald-400 text-sm">{p.code}</p>
 <p className="text-[11px] text-slate-300 font-semibold">{p.name}</p>
 </td>

 {/* Type & Value */}
 <td className="p-4">
 <span className="inline-flex items-center space-x-1 font-bold text-slate-200">
 {p.type === 'PERCENTAGE' ? (
 <>
 <Percent className="w-3.5 h-3.5 text-indigo-400" />
 <span>{p.value}% Off</span>
 {p.maxDiscount && (
 <span className="text-[10px] text-slate-500 font-normal">
 (Max {formatRupiah(Number(p.maxDiscount))})
 </span>
 )}
 </>
 ) : (
 <>
 <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
 <span>{formatRupiah(Number(p.value))} Off</span>
 </>
 )}
 </span>
 </td>

 {/* Min Purchase */}
 <td className="p-4 text-slate-300 font-medium">
 {formatRupiah(Number(p.minPurchase))}
 </td>

 {/* Usage Count */}
 <td className="p-4">
 <span className="font-mono text-indigo-400 font-semibold">
 {p.usedCount} / {p.usageLimit} used
 </span>
 </td>

 {/* Status Badge */}
 <td className="p-4">
 {p.isActive ? (
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
 <CheckCircle className="w-3 h-3" />
 <span>Active</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
 <XCircle className="w-3 h-3" />
 <span>Disabled</span>
 </span>
 )}
 </td>

 {/* Action Toggle */}
 <td className="p-4 text-right">
 <button
 onClick={() => toggleMutation.mutate(p.id)}
 disabled={toggleMutation.isPending}
 className={`px-3 py-1.5 rounded-xl font-medium text-[11px] transition-colors ${
 p.isActive
 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
 : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
 }`}
 >
 {p.isActive ? 'Deactivate' : 'Activate'}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Create Coupon Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
 <form
 onSubmit={handleSubmit}
 className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6"
 >
 <div className="flex items-center justify-between pb-4 border-b border-slate-800">
 <div>
 <h3 className="font-bold text-white text-base flex items-center space-x-2">
 <Tag className="w-5 h-5 text-emerald-400" />
 <span>Create New Promo Voucher</span>
 </h3>
 <p className="text-xs text-slate-400 mt-1">Configure discount rules and limits</p>
 </div>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
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
 <label className="block text-slate-300 font-semibold mb-1">Coupon Code</label>
 <input
 type="text"
 placeholder="e.g. BLACKFRIDAY20"
 value={code}
 onChange={(e) => setCode(e.target.value.toUpperCase())}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono uppercase"
 />
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Campaign Name</label>
 <input
 type="text"
 placeholder="e.g. Black Friday 20% Special Discount"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Discount Type</label>
 <select
 value={type}
 onChange={(e) => setType(e.target.value as any)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
 >
 <option value="PERCENTAGE">Percentage (%)</option>
 <option value="FIXED_AMOUNT">Fixed Amount (Rp)</option>
 </select>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Discount Value</label>
 <input
 type="number"
 value={value}
 onChange={(e) => setValue(Number(e.target.value))}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Min. Purchase (Rp)</label>
 <input
 type="number"
 value={minPurchase}
 onChange={(e) => setMinPurchase(Number(e.target.value))}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
 />
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Max Discount Cap (Rp)</label>
 <input
 type="number"
 placeholder="Optional cap"
 value={maxDiscount || ''}
 onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Max Usage Limit</label>
 <input
 type="number"
 value={usageLimit}
 onChange={(e) => setUsageLimit(Number(e.target.value))}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={createMutation.isPending}
 className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
 >
 {createMutation.isPending ? 'Creating...' : 'Save Coupon'}
 </button>
 </div>
 </form>
 </div>
 )}
 </div>
 );
};

export default AdminPromotionsPage;
