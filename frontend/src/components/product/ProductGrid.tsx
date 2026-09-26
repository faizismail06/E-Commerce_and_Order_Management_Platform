import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
 products: Product[];
 isLoading: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
 if (isLoading) {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {Array.from({ length: 8 }).map((_, i) => (
 <div
 key={i}
 className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex flex-col justify-between p-4"
 >
 <div className="w-full aspect-square bg-slate-800 rounded-xl mb-4" />
 <div className="space-y-2">
 <div className="h-4 bg-slate-800 rounded w-3/4" />
 <div className="h-3 bg-slate-800 rounded w-1/2" />
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (products.length === 0) {
 return (
 <div className="min-h-[350px] flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center">
 <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
 <PackageSearch className="w-8 h-8 text-indigo-400" />
 </div>
 <h3 className="text-lg font-bold text-white">No products found</h3>
 <p className="text-xs text-slate-400 mt-1 max-w-sm">
 Try adjusting your search criteria or selecting a different category filter.
 </p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {products.map((product) => (
 <ProductCard key={product.id} product={product} />
 ))}
 </div>
 );
};
