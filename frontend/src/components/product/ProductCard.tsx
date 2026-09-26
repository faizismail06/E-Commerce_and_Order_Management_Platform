import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import { Star, ShoppingBag, Eye, Tag } from 'lucide-react';

interface ProductCardProps {
 product: Product;
}

export const formatRupiah = (amount: number | string) => {
 const num = typeof amount === 'string' ? parseFloat(amount) : amount;
 return new Intl.NumberFormat('id-ID', {
 style: 'currency',
 currency: 'IDR',
 maximumFractionDigits: 0,
 }).format(num);
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
 const primaryImage =
 product.images?.find((img) => img.isPrimary)?.url ||
 product.images?.[0]?.url ||
 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

 const isOutOfStock = product.availableStock <= 0;
 const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
 const discountNum = product.discountPrice
 ? typeof product.discountPrice === 'string'
 ? parseFloat(product.discountPrice)
 : product.discountPrice
 : null;

 const hasDiscount = discountNum !== null && discountNum < priceNum;
 const discountPercent = hasDiscount
 ? Math.round(((priceNum - discountNum!) / priceNum) * 100)
 : 0;

 return (
 <div className="group relative bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-indigo-500/40 transition-all duration-300 flex flex-col shadow-xl">
 {/* Product Image Container */}
 <div className="relative aspect-square overflow-hidden bg-slate-950">
 <img
 src={primaryImage}
 alt={product.name}
 className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
 isOutOfStock ? 'opacity-40 grayscale' : ''
 }`}
 />

 {/* Badges Overlay */}
 <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
 {hasDiscount && !isOutOfStock && (
 <span className="px-2.5 py-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
 <Tag className="w-3 h-3" />
 {discountPercent}% OFF
 </span>
 )}
 <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-slate-300 font-semibold text-[10px] rounded-lg border border-slate-700/60">
 {product.category.name}
 </span>
 </div>

 {/* Out of Stock Overlay Badge */}
 {isOutOfStock && (
 <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm z-20">
 <span className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl uppercase tracking-widest">
 Out of Stock
 </span>
 </div>
 )}

 {/* Hover Quick Actions */}
 {!isOutOfStock && (
 <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
 <Link
 to={`/products/${product.slug}`}
 className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
 title="View Product Details"
 >
 <Eye className="w-4 h-4" />
 </Link>
 </div>
 )}
 </div>

 {/* Product Content Details */}
 <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
 <div>
 {/* SKU & Rating */}
 <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
 <span className="font-mono text-slate-500">{product.sku}</span>
 <div className="flex items-center space-x-1 text-amber-400">
 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
 <span className="font-bold text-slate-200">{product.ratingAverage || '5.0'}</span>
 <span className="text-slate-500">({product.totalReviews})</span>
 </div>
 </div>

 {/* Product Name */}
 <Link
 to={`/products/${product.slug}`}
 className="font-bold text-sm text-slate-100 hover:text-indigo-400 line-clamp-2 transition-colors"
 >
 {product.name}
 </Link>
 </div>

 {/* Price & Action Button */}
 <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
 <div>
 {hasDiscount ? (
 <div>
 <p className="text-xs text-slate-500 line-through">
 {formatRupiah(priceNum)}
 </p>
 <p className="text-base font-extrabold text-indigo-400">
 {formatRupiah(discountNum!)}
 </p>
 </div>
 ) : (
 <p className="text-base font-extrabold text-white">
 {formatRupiah(priceNum)}
 </p>
 )}
 </div>

 <Link
 to={`/products/${product.slug}`}
 className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
 isOutOfStock
 ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
 : 'bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-600 text-indigo-300 hover:text-white'
 }`}
 >
 <ShoppingBag className="w-3.5 h-3.5" />
 <span>{isOutOfStock ? 'Sold Out' : 'Details'}</span>
 </Link>
 </div>
 </div>
 </div>
 );
};
