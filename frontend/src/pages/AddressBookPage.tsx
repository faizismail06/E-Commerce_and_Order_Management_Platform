import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAddresses, createAddress, deleteAddress, setDefaultAddress } from '../api/address';
import { MapPin, Plus, Trash2, CheckCircle2, Phone, User, X, AlertCircle } from 'lucide-react';

export const AddressBookPage: React.FC = () => {
 const queryClient = useQueryClient();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 // Form State
 const [recipientName, setRecipientName] = useState('');
 const [phone, setPhone] = useState('');
 const [province, setProvince] = useState('');
 const [city, setCity] = useState('');
 const [district, setDistrict] = useState('');
 const [postalCode, setPostalCode] = useState('');
 const [fullAddress, setFullAddress] = useState('');
 const [label, setLabel] = useState('Home');
 const [isDefault, setIsDefault] = useState(false);

 const { data: addresses = [], isLoading } = useQuery({
 queryKey: ['addresses'],
 queryFn: fetchAddresses,
 });

 const deleteMutation = useMutation({
 mutationFn: deleteAddress,
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
 });

 const setDefaultMutation = useMutation({
 mutationFn: setDefaultAddress,
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
 });

 const handleCreateAddress = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMsg(null);

 try {
 await createAddress({
 recipientName,
 phone,
 province,
 city,
 district,
 postalCode,
 fullAddress,
 label,
 isDefault,
 });

 setIsModalOpen(false);
 resetForm();
 queryClient.invalidateQueries({ queryKey: ['addresses'] });
 } catch (err: any) {
 setErrorMsg(err.response?.data?.error?.message || 'Failed to save address');
 }
 };

 const resetForm = () => {
 setRecipientName('');
 setPhone('');
 setProvince('');
 setCity('');
 setDistrict('');
 setPostalCode('');
 setFullAddress('');
 setLabel('Home');
 setIsDefault(false);
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
 <MapPin className="w-8 h-8 text-indigo-400" />
 <span>Delivery Address Book</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Manage your saved delivery locations and select a default shipping address.
 </p>
 </div>

 <button
 onClick={() => {
 resetForm();
 setIsModalOpen(true);
 }}
 className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all hover:scale-105"
 >
 <Plus className="w-4 h-4" />
 <span>Add New Address</span>
 </button>
 </div>

 {/* Address Grid */}
 {isLoading ? (
 <div className="text-center py-12 text-slate-500 text-xs">Loading saved addresses...</div>
 ) : addresses.length === 0 ? (
 <div className="min-h-[300px] flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-3">
 <MapPin className="w-10 h-10 text-slate-600" />
 <h3 className="text-lg font-bold text-white">No delivery addresses saved</h3>
 <p className="text-xs text-slate-400 max-w-sm">
 Add a shipping address to enable seamless multi-address checkout.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {addresses.map((addr) => (
 <div
 key={addr.id}
 className={`p-6 rounded-2xl bg-slate-900/60 border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
 addr.isDefault
 ? 'border-indigo-500/60 ring-1 ring-indigo-500/20'
 : 'border-slate-800 hover:border-slate-700'
 }`}
 >
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px] uppercase tracking-wider">
 {addr.label}
 </span>
 {addr.isDefault && (
 <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center space-x-1">
 <CheckCircle2 className="w-3 h-3" />
 <span>DEFAULT</span>
 </span>
 )}
 </div>

 <button
 onClick={() => deleteMutation.mutate(addr.id)}
 className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>

 <div>
 <p className="font-bold text-base text-white flex items-center space-x-2">
 <User className="w-4 h-4 text-slate-400" />
 <span>{addr.recipientName}</span>
 </p>
 <p className="text-xs text-slate-400 flex items-center space-x-2 mt-1 font-mono">
 <Phone className="w-3.5 h-3.5 text-slate-500" />
 <span>{addr.phone}</span>
 </p>
 </div>

 <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
 <p className="font-medium">{addr.fullAddress}</p>
 <p className="text-slate-400 mt-1">
 {addr.district}, {addr.city}, {addr.province} {addr.postalCode}
 </p>
 </div>
 </div>

 {!addr.isDefault && (
 <button
 onClick={() => setDefaultMutation.mutate(addr.id)}
 className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
 >
 Set as Default Address
 </button>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Add Address Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
 <div className="flex items-center justify-between pb-4 border-b border-slate-800">
 <h3 className="text-lg font-bold text-white">Add Delivery Address</h3>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>

 {errorMsg && (
 <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
 <AlertCircle className="w-4 h-4" />
 <span>{errorMsg}</span>
 </div>
 )}

 <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Recipient Name</label>
 <input
 type="text"
 required
 value={recipientName}
 onChange={(e) => setRecipientName(e.target.value)}
 placeholder="Faiz Ismail"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
 <input
 type="tel"
 required
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+6281234567890"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Province</label>
 <input
 type="text"
 required
 value={province}
 onChange={(e) => setProvince(e.target.value)}
 placeholder="DKI Jakarta"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">City</label>
 <input
 type="text"
 required
 value={city}
 onChange={(e) => setCity(e.target.value)}
 placeholder="Jakarta Selatan"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">District</label>
 <input
 type="text"
 required
 value={district}
 onChange={(e) => setDistrict(e.target.value)}
 placeholder="Kebayoran Baru"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Postal Code</label>
 <input
 type="text"
 required
 value={postalCode}
 onChange={(e) => setPostalCode(e.target.value)}
 placeholder="12110"
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Address Label</label>
 <select
 value={label}
 onChange={(e) => setLabel(e.target.value)}
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 >
 <option value="Home">Home</option>
 <option value="Office">Office</option>
 <option value="Warehouse">Warehouse</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-slate-300 font-semibold mb-1">Full Street Address</label>
 <textarea
 rows={3}
 required
 value={fullAddress}
 onChange={(e) => setFullAddress(e.target.value)}
 placeholder="Jl. Sudirman No. 45, RT 01/RW 02..."
 className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div className="flex items-center space-x-2 pt-2">
 <input
 type="checkbox"
 id="isDefaultCheck"
 checked={isDefault}
 onChange={(e) => setIsDefault(e.target.checked)}
 className="w-4 h-4 accent-indigo-600 rounded"
 />
 <label htmlFor="isDefaultCheck" className="text-slate-300 font-semibold cursor-pointer">
 Set as default delivery address
 </label>
 </div>

 <div className="pt-4 flex items-center justify-end space-x-3">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25"
 >
 Save Address
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};
