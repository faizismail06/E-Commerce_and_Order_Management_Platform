import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, createAdminProduct, deleteAdminProduct } from '../../api/products';
import { Product } from '../../types/product';
import { formatRupiah } from '../../components/product/ProductCard';
import { Package, Plus, Trash2, Edit, Search, AlertCircle, X } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [searchTerm, setSearchTerm] = useState('');
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 // Form State
 const [sku, setSku] = useState('');
 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [price, setPrice] = useState('');
 const [discountPrice, setDiscountPrice] = useState('');
 const [stock, setStock] = useState('10');
 const [weight, setWeight] = useState('500');
 const [categoryId, setCategoryId] = useState('');
 const [imageUrl, setImageUrl] = useState('');

 const { data: categories = [] } = useQuery({
 queryKey: ['categories'],
 queryFn: fetchCategories,
 });

 const { data, isLoading } = useQuery({
 queryKey: ['admin-products', searchTerm],
 queryFn: () => fetchProducts({ search: searchTerm, limit: 50 }),
 });

 const products = data?.products || [];

 const deleteMutation = useMutation({
 mutationFn: deleteAdminProduct,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-products'] });
 },
 });

 const handleCreateProduct = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMsg(null);

 try {
 await createAdminProduct({
 sku,
 name,
 description,
 price: parseFloat(price),
 discountPrice: discountPrice ? parseFloat(discountPrice) : null,
 stock: parseInt(stock, 10),
 weight: parseInt(weight, 10),
 categoryId: categoryId || categories[0]?.id,
 images: [{ url: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', isPrimary: true }],
 });

 setIsCreateModalOpen(false);
 resetForm();
 queryClient.invalidateQueries({ queryKey: ['admin-products'] });
 } catch (err: any) {
 setErrorMsg(err.response?.data?.error?.message || 'Failed to create product');
 }
 };

 const resetForm = () => {
 setSku('');
 setName('');
 setDescription('');
 setPrice('');
 setDiscountPrice('');
 setStock('10');
 setWeight('500');
 setCategoryId('');
 setImageUrl('');
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
 <Package className="w-6 h-6 text-indigo-400" />
 <span>Product Catalog Management</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Create, update, and manage inventory stock levels across all categories.
 </p>
 </div>

 <button
 onClick={() => {
 resetForm();
 if (categories.length > 0) setCategoryId(categories[0].id);
 setIsCreateModalOpen(true);
 }}
 className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all hover:scale-105"
 >
 <Plus className="w-4 h-4" />
 <span>Add New Product</span>
 </button>
 </div>

 {/* Search Filter Bar */}
 <div className="relative max-w-md">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 <Search className="w-4 h-4" />
 </div>
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Filter admin catalog by SKU, name..."
 className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
 />
 </div>

 {/* Data Table */}
 <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider">
 <tr>
 <th className="py-3.5 px-4">Product</th>
 <th className="py-3.5 px-4">SKU</th>
 <th className="py-3.5 px-4">Category</th>
 <th className="py-3.5 px-4">Price</th>
 <th className="py-3.5 px-4">Available Stock</th>
 <th className="py-3.5 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-slate-300">
 {isLoading ? (
 <tr>
 <td colSpan={6} className="text-center py-8 text-slate-500">
 Loading product catalog...
 </td>
 </tr>
 ) : products.length === 0 ? (
 <tr>
 <td colSpan={6} className="text-center py-8 text-slate-500">
 No products found matching query.
 </td>
 </tr>
 ) : (
 products.map((p) => (
 <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
 <td className="py-3 px-4 flex items-center space-x-3">
 <img
 src={p.images?.[0]?.url || 'https://via.placeholder.com/40'}
 alt=""
 className="w-10 h-10 rounded-lg object-cover bg-slate-950"
 />
 <div>
 <p className="font-bold text-white line-clamp-1">{p.name}</p>
 <p className="text-[10px] text-slate-500">{p.weight}g</p>
 </div>
 </td>
 <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
 <td className="py-3 px-4 font-medium text-slate-300">{p.category.name}</td>
 <td className="py-3 px-4 font-extrabold text-indigo-400">
 {formatRupiah(p.discountPrice || p.price)}
 </td>
 <td className="py-3 px-4">
 <span
 className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
 p.availableStock <= 0
 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
 : p.availableStock <= 5
 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
 : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
 }`}
 >
 {p.availableStock <= 0 ? 'OUT OF STOCK' : `${p.availableStock} Units`}
 </span>
 </td>
 <td className="py-3 px-4 text-right">
 <div className="flex items-center justify-end space-x-2">
 <button
 onClick={() => deleteMutation.mutate(p.id)}
 className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
 title="Soft Delete Product"
 >
 <Trash2 className="w-4 h-4" />
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

 {/* Create Product Modal */}
 {isCreateModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
 <div className="flex items-center justify-between pb-4 border-b border-slate-800">
 <h3 className="text-lg font-bold text-white">Create New Catalog Product</h3>
 <button
 onClick={() => setIsCreateModalOpen(false)}
 className="text-slate-400 hover:text-white"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
 <AlertCircle className="w-4 h-4" />
 <span>{errorMsg}</span>
 </div>
 )}

 <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
 <input
 type="text"
 required
 value={sku}
 onChange={(e) => setSku(e.target.value)}
 placeholder="SKU-ELE-999"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Category</label>
 <select
 value={categoryId}
 onChange={(e) => setCategoryId(e.target.value)}
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 >
 {categories.map((c) => (
 <option key={c.id} value={c.id}>
 {c.name}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Product Title</label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Pro Wireless Mechanical Keyboard"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Description</label>
 <textarea
 rows={3}
 required
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Detailed product features and specifications..."
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Price (Rp)</label>
 <input
 type="number"
 required
 value={price}
 onChange={(e) => setPrice(e.target.value)}
 placeholder="1500000"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Discount Price (Optional)</label>
 <input
 type="number"
 value={discountPrice}
 onChange={(e) => setDiscountPrice(e.target.value)}
 placeholder="1299000"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Initial Stock</label>
 <input
 type="number"
 required
 value={stock}
 onChange={(e) => setStock(e.target.value)}
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Weight (Grams)</label>
 <input
 type="number"
 required
 value={weight}
 onChange={(e) => setWeight(e.target.value)}
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Primary Image URL</label>
 <input
 type="url"
 value={imageUrl}
 onChange={(e) => setImageUrl(e.target.value)}
 placeholder="https://images.unsplash.com/..."
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div className="pt-4 flex items-center justify-end space-x-3">
 <button
 type="button"
 onClick={() => setIsCreateModalOpen(false)}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25"
 >
 Create Product
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};
