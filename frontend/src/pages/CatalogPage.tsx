import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchProducts } from '../api/products';
import { ProductFilters } from '../types/product';
import { ProductFilterToolbar } from '../components/product/ProductFilterToolbar';
import { ProductGrid } from '../components/product/ProductGrid';
import { Pagination } from '../components/product/Pagination';
import { ShoppingBag } from 'lucide-react';

export const CatalogPage: React.FC = () => {
 const [filters, setFilters] = useState<ProductFilters>({
 page: 1,
 limit: 12,
 sortBy: 'newest',
 });

 const { data: categories = [] } = useQuery({
 queryKey: ['categories'],
 queryFn: fetchCategories,
 });

 const { data, isLoading } = useQuery({
 queryKey: ['products', filters],
 queryFn: () => fetchProducts(filters),
 });

 const products = data?.products || [];
 const meta = data?.meta || { page: 1, limit: 12, totalItems: 0, totalPages: 1 };

 const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
 setFilters((prev) => ({ ...prev, ...newFilters }));
 };

 const handleResetFilters = () => {
 setFilters({
 page: 1,
 limit: 12,
 sortBy: 'newest',
 });
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Header Banner */}
 <div className="flex items-center justify-between pb-6 border-b border-slate-800">
 <div>
 <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
 <ShoppingBag className="w-8 h-8 text-indigo-400" />
 <span>Product Catalog</span>
 </h1>
 <p className="text-xs text-slate-400 mt-1">
 Explore our curated inventory of 50+ premium products across 8 categories.
 </p>
 </div>
 </div>

 {/* Filter Toolbar */}
 <ProductFilterToolbar
 categories={categories}
 filters={filters}
 onFilterChange={handleFilterChange}
 onResetFilters={handleResetFilters}
 />

 {/* Product Grid */}
 <ProductGrid products={products} isLoading={isLoading} />

 {/* Pagination Controls */}
 <Pagination meta={meta} onPageChange={(page) => handleFilterChange({ page })} />
 </div>
 );
};
