import React from 'react';
import { PaginationMeta } from '../../types/product';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
 meta: PaginationMeta;
 onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
 if (meta.totalPages <= 1) return null;

 return (
 <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs">
 <p className="text-slate-400 font-mono">
 Showing Page <span className="text-white font-bold">{meta.page}</span> of{' '}
 <span className="text-white font-bold">{meta.totalPages}</span> ({meta.totalItems} Total Products)
 </p>

 <div className="flex items-center space-x-2">
 <button
 onClick={() => onPageChange(meta.page - 1)}
 disabled={meta.page <= 1}
 className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>

 {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
 <button
 key={p}
 onClick={() => onPageChange(p)}
 className={`w-8 h-8 rounded-xl font-semibold transition-all ${
 meta.page === p
 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
 : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
 }`}
 >
 {p}
 </button>
 ))}

 <button
 onClick={() => onPageChange(meta.page + 1)}
 disabled={meta.page >= meta.totalPages}
 className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
};
