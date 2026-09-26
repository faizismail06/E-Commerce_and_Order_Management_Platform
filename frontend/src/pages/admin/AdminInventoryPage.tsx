import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInventory, adjustStock, fetchMovements, triggerExpiredScan } from '../../api/inventory';
import { InventoryItem } from '../../types/inventory';
import {
 Boxes,
 AlertTriangle,
 Search,
 SlidersHorizontal,
 History,
 ArrowUpRight,
 ArrowDownRight,
 RefreshCw,
 X,
 CheckCircle2,
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [searchTerm, setSearchTerm] = useState('');
 const [lowStockOnly, setLowStockOnly] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
 const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
 const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

 // Form State
 const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
 const [quantity, setQuantity] = useState('10');
 const [notes, setNotes] = useState('');
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const { data, isLoading } = useQuery({
 queryKey: ['admin-inventory', searchTerm, lowStockOnly],
 queryFn: () => fetchInventory(searchTerm, lowStockOnly),
 });

 const { data: movements = [], isLoading: isLoadingMovements } = useQuery({
 queryKey: ['admin-movements', selectedProduct?.id],
 queryFn: () => fetchMovements(selectedProduct?.id),
 enabled: isHistoryModalOpen && !!selectedProduct,
 });

 const adjustMutation = useMutation({
 mutationFn: adjustStock,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
 setIsAdjustModalOpen(false);
 resetForm();
 },
 onError: (err: any) => {
 setErrorMsg(err.response?.data?.error?.message || 'Failed to adjust stock');
 },
 });

 const expireScanMutation = useMutation({
 mutationFn: triggerExpiredScan,
 onSuccess: (res) => {
 alert(`Scanned expired orders: ${res.processedCount} order(s) processed & stock released.`);
 queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
 },
 });

 const items = data?.items || [];
 const summary = data?.summary || { totalProducts: 0, totalLowStockCount: 0, totalOutOfStockCount: 0 };

 const handleAdjustSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMsg(null);
 if (!selectedProduct) return;

 adjustMutation.mutate({
 productId: selectedProduct.id,
 type: adjustType,
 quantity: parseInt(quantity, 10),
 notes,
 });
 };

 const resetForm = () => {
 setSelectedProduct(null);
 setAdjustType('IN');
 setQuantity('10');
 setNotes('');
 setErrorMsg(null);
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <Boxes className="w-6 h-6 text-indigo-400" />
 <span>Inventory & Concurrency Synchronization</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Real-time tracking of Current, Reserved, and Available stock levels with low stock alerts.
 </p>
 </div>

 <button
 onClick={() => expireScanMutation.mutate()}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all"
 title="Scan and release stock for expired pending orders (>24h)"
 >
 <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
 <span>Auto-Release Expired Stock</span>
 </button>
 </div>

 {/* Summary KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
 <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
 <p className="text-xs text-slate-400 font-medium">Total Products Monitored</p>
 <p className="text-2xl font-extrabold text-white">{summary.totalProducts}</p>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-amber-500/30 space-y-1">
 <div className="flex items-center justify-between">
 <p className="text-xs text-amber-400 font-medium">Low Stock Alerts (Available ≤ Min)</p>
 <AlertTriangle className="w-4 h-4 text-amber-400" />
 </div>
 <p className="text-2xl font-extrabold text-amber-300">{summary.totalLowStockCount}</p>
 </div>

 <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/30 space-y-1">
 <p className="text-xs text-rose-400 font-medium">Out of Stock Count</p>
 <p className="text-2xl font-extrabold text-rose-300">{summary.totalOutOfStockCount}</p>
 </div>
 </div>

 {/* Filter & Toolbar */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
 <div className="relative flex-1 max-w-md">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 <Search className="w-4 h-4" />
 </div>
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Filter inventory by SKU or Product Name..."
 className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <button
 onClick={() => setLowStockOnly(!lowStockOnly)}
 className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
 lowStockOnly
 ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
 : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
 }`}
 >
 <SlidersHorizontal className="w-3.5 h-3.5" />
 <span>{lowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock Alerts'}</span>
 </button>
 </div>

 {/* Inventory Data Table */}
 <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider">
 <tr>
 <th className="py-3.5 px-4">Product</th>
 <th className="py-3.5 px-4">SKU</th>
 <th className="py-3.5 px-4">Current Stock</th>
 <th className="py-3.5 px-4">Reserved Stock</th>
 <th className="py-3.5 px-4">Available Stock</th>
 <th className="py-3.5 px-4">Status</th>
 <th className="py-3.5 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-slate-300">
 {isLoading ? (
 <tr>
 <td colSpan={7} className="text-center py-8 text-slate-500">
 Loading inventory audit data...
 </td>
 </tr>
 ) : items.length === 0 ? (
 <tr>
 <td colSpan={7} className="text-center py-8 text-slate-500">
 No products found matching inventory query.
 </td>
 </tr>
 ) : (
 items.map((item) => (
 <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
 <td className="py-3 px-4 flex items-center space-x-3">
 <img
 src={item.image}
 alt=""
 className="w-9 h-9 rounded-lg object-cover bg-slate-950"
 />
 <div>
 <p className="font-bold text-white line-clamp-1">{item.name}</p>
 <p className="text-[10px] text-slate-500">{item.category}</p>
 </div>
 </td>
 <td className="py-3 px-4 font-mono text-slate-400">{item.sku}</td>
 <td className="py-3 px-4 font-bold text-slate-200">{item.currentStock}</td>
 <td className="py-3 px-4 font-mono text-amber-400">{item.reservedStock}</td>
 <td className="py-3 px-4 font-extrabold text-white">{item.availableStock}</td>
 <td className="py-3 px-4">
 {item.availableStock <= 0 ? (
 <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
 OUT OF STOCK
 </span>
 ) : item.isLowStock ? (
 <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px] flex items-center space-x-1 w-fit">
 <AlertTriangle className="w-3 h-3" />
 <span>LOW STOCK</span>
 </span>
 ) : (
 <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
 IN STOCK
 </span>
 )}
 </td>
 <td className="py-3 px-4 text-right">
 <div className="flex items-center justify-end space-x-2">
 <button
 onClick={() => {
 setSelectedProduct(item);
 setIsHistoryModalOpen(true);
 }}
 className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
 title="View Movement History"
 >
 <History className="w-4 h-4" />
 </button>
 <button
 onClick={() => {
 setSelectedProduct(item);
 setIsAdjustModalOpen(true);
 }}
 className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white font-semibold text-[11px] transition-all"
 >
 Adjust Stock
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Adjust Stock Modal */}
 {isAdjustModalOpen && selectedProduct && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800">
 <div>
 <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
 <p className="text-[11px] font-mono text-slate-400">{selectedProduct.sku}</p>
 </div>
 <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
 {errorMsg}
 </div>
 )}

 <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Adjustment Type</label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 onClick={() => setAdjustType('IN')}
 className={`py-2 rounded-xl font-bold border transition-all flex items-center justify-center space-x-1 ${
 adjustType === 'IN'
 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
 : 'bg-slate-950 border-slate-800 text-slate-400'
 }`}
 >
 <ArrowUpRight className="w-4 h-4 text-emerald-400" />
 <span>RESTOCK (IN)</span>
 </button>

 <button
 type="button"
 onClick={() => setAdjustType('OUT')}
 className={`py-2 rounded-xl font-bold border transition-all flex items-center justify-center space-x-1 ${
 adjustType === 'OUT'
 ? 'bg-rose-500/20 border-rose-500 text-rose-300'
 : 'bg-slate-950 border-slate-800 text-slate-400'
 }`}
 >
 <ArrowDownRight className="w-4 h-4 text-rose-400" />
 <span>REDUCE (OUT)</span>
 </button>
 </div>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
 <input
 type="number"
 required
 min="1"
 value={quantity}
 onChange={(e) => setQuantity(e.target.value)}
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Adjustment Reason / Notes</label>
 <textarea
 rows={3}
 required
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Restock from warehouse batch #402..."
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div className="pt-3 flex items-center justify-end space-x-3">
 <button
 type="button"
 onClick={() => setIsAdjustModalOpen(false)}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={adjustMutation.isPending}
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25"
 >
 Save Adjustment
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Movement History Drawer */}
 {isHistoryModalOpen && selectedProduct && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800">
 <div>
 <h3 className="text-base font-bold text-white">Stock Movement Audit Trail</h3>
 <p className="text-[11px] text-indigo-400 font-mono">{selectedProduct.name}</p>
 </div>
 <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto space-y-3">
 {isLoadingMovements ? (
 <p className="text-xs text-slate-500 text-center py-4">Loading movement logs...</p>
 ) : movements.length === 0 ? (
 <p className="text-xs text-slate-500 text-center py-4">No movement history recorded yet.</p>
 ) : (
 movements.map((m) => (
 <div key={m.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
 <div className="flex items-center justify-between">
 <span
 className={`px-2 py-0.5 rounded text-[10px] font-bold ${
 m.type === 'IN'
 ? 'bg-emerald-500/20 text-emerald-300'
 : m.type === 'RESERVE'
 ? 'bg-amber-500/20 text-amber-300'
 : m.type === 'RELEASE'
 ? 'bg-indigo-500/20 text-indigo-300'
 : 'bg-rose-500/20 text-rose-300'
 }`}
 >
 {m.type} ({m.quantity})
 </span>
 <span className="text-[10px] text-slate-500 font-mono">
 {new Date(m.createdAt).toLocaleString('id-ID')}
 </span>
 </div>
 <p className="font-mono text-[11px] text-slate-400">Ref: {m.reference}</p>
 {m.notes && <p className="text-slate-300 text-[11px]">{m.notes}</p>}
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
