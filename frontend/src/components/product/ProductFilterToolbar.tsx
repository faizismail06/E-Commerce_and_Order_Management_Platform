import React from 'react';
import { Category, ProductFilters } from '../../types/product';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ProductFilterToolbarProps {
 categories: Category[];
 filters: ProductFilters;
 onFilterChange: (newFilters: Partial<ProductFilters>) => void;
 onResetFilters: () => void;
}

export const ProductFilterToolbar: React.FC<ProductFilterToolbarProps> = ({
 categories,
 filters,
 onFilterChange,
 onResetFilters,
}) => {
 return (
 <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
 {/* Top Bar: Search + Category Pills */}
 <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
 {/* Search Input */}
 <div className="relative flex-1">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 <Search className="w-4 h-4" />
 </div>
 <input
 type="text"
 value={filters.search || ''}
 onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
 placeholder="Search products by name, description, or SKU..."
 className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
 />
 </div>

 {/* Sort By Dropdown */}
 <div className="flex items-center space-x-3">
 <div className="flex items-center space-x-2 text-xs text-slate-400">
 <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
 <span className="font-semibold hidden sm:inline">Sort By:</span>
 </div>
 <select
 value={filters.sortBy || 'newest'}
 onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
 className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-medium"
 >
 <option value="newest">Newest Arrivals</option>
 <option value="price_asc">Price: Low to High</option>
 <option value="price_desc">Price: High to Low</option>
 </select>

 <button
 onClick={onResetFilters}
 className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
 title="Reset Filters"
 >
 <RotateCcw className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Category Pills Selector */}
 <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
 <button
 onClick={() => onFilterChange({ category: undefined, page: 1 })}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
 !filters.category
 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
 : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50'
 }`}
 >
 All Products
 </button>
 {categories.map((cat) => (
 <button
 key={cat.id}
 onClick={() => onFilterChange({ category: cat.slug, page: 1 })}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
 filters.category === cat.slug
 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
 : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50'
 }`}
 >
 {cat.name}
 </button>
 ))}
 </div>
 </div>
 );
};
