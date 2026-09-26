import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductBySlug } from '../api/products';
import { fetchProductReviews, submitProductReview, SubmitReviewPayload } from '../api/reviews';
import { fetchOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../components/product/ProductCard';
import {
 Star,
 ShoppingBag,
 ShieldCheck,
 Truck,
 ArrowLeft,
 Tag,
 Scale,
 Minus,
 Plus,
 AlertTriangle,
 MessageSquarePlus,
 CheckCircle,
 X,
 UserCheck,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
 const { slug } = useParams<{ slug: string }>();
 const queryClient = useQueryClient();
 const { isAuthenticated } = useAuth();
 const { addToCart, setIsDrawerOpen } = useCart();

 const [selectedImageIndex, setSelectedImageIndex] = useState(0);
 const [quantity, setQuantity] = useState(1);
 const [cartSuccess, setCartSuccess] = useState(false);

 // Review Modal State
 const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
 const [reviewRating, setReviewRating] = useState(5);
 const [reviewComment, setReviewComment] = useState('');
 const [selectedOrderId, setSelectedOrderId] = useState('');
 const [reviewError, setReviewError] = useState('');

 // 1. Fetch Product Detail
 const { data: product, isLoading, isError } = useQuery({
 queryKey: ['product', slug],
 queryFn: () => fetchProductBySlug(slug!),
 enabled: !!slug,
 });

 // 2. Fetch Product Reviews & Star Breakdown
 const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
 queryKey: ['productReviews', product?.id],
 queryFn: () => fetchProductReviews(product!.id),
 enabled: !!product?.id,
 });

 // 3. Fetch User Orders to check for verified purchase order ID
 const { data: userOrders = [] } = useQuery({
 queryKey: ['orders'],
 queryFn: fetchOrders,
 enabled: isAuthenticated && isReviewModalOpen,
 });

 // Filter completed/paid orders that contain this product
 const validPurchaseOrders = userOrders.filter(
 (ord: any) =>
 ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(ord.orderStatus) &&
 ord.items?.some((item: any) => item.productId === product?.id)
 );

 const submitReviewMutation = useMutation({
 mutationFn: ({ productId, payload }: { productId: string; payload: SubmitReviewPayload }) =>
 submitProductReview(productId, payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['productReviews', product?.id] });
 queryClient.invalidateQueries({ queryKey: ['product', slug] });
 setIsReviewModalOpen(false);
 setReviewComment('');
 setReviewError('');
 },
 onError: (err: any) => {
 setReviewError(err.response?.data?.error?.message || 'Failed to submit review');
 },
 });

 const handleReviewSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setReviewError('');
 if (!selectedOrderId) {
 setReviewError('Please select a verified purchase order');
 return;
 }
 if (!reviewComment.trim() || reviewComment.length < 3) {
 setReviewError('Please write a review comment at least 3 characters long');
 return;
 }

 if (!product) return;

 submitReviewMutation.mutate({
 productId: product.id,
 payload: {
 orderId: selectedOrderId,
 rating: reviewRating,
 comment: reviewComment.trim(),
 },
 });
 };

 if (isLoading) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
 <div className="flex flex-col items-center space-y-4">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
 <p className="text-xs text-slate-400 font-medium">Loading product details...</p>
 </div>
 </div>
 );
 }

 if (isError || !product) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-16 text-center">
 <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
 <AlertTriangle className="w-8 h-8" />
 </div>
 <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
 <p className="text-xs text-slate-400 mt-1">The requested product SKU or slug does not exist.</p>
 <Link
 to="/"
 className="inline-flex items-center space-x-2 mt-6 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>Back to Catalog</span>
 </Link>
 </div>
 );
 }

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

 const primaryImages =
 product.images && product.images.length > 0
 ? product.images
 : [
 {
 id: 'fallback',
 url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
 isPrimary: true,
 },
 ];

 const handleAddToCart = async () => {
 if (!product) return;
 try {
 await addToCart(product.id, quantity, false);
 setCartSuccess(true);
 setTimeout(() => setCartSuccess(false), 3000);
 } catch (err) {
 console.error('Add to cart failed:', err);
 }
 };

 const handleBuyNow = async () => {
 if (!product) return;
 try {
 await addToCart(product.id, quantity, true);
 } catch (err) {
 console.error('Buy now failed:', err);
 }
 };

 const reviewSummary = reviewsData?.summary || { ratingAvg: 0, totalReviews: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
 const reviewsList = reviewsData?.reviews || [];

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
 {/* Back Button Breadcrumb */}
 <Link
 to="/"
 className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>Back to Product Catalog</span>
 </Link>

 {/* PDP Grid Container */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 {/* Image Gallery */}
 <div className="space-y-4">
 <div className="relative aspect-square rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
 <img
 src={primaryImages[selectedImageIndex]?.url}
 alt={product.name}
 className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
 />

 {hasDiscount && !isOutOfStock && (
 <span className="absolute top-4 left-4 px-3 py-1.5 bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-1 z-10">
 <Tag className="w-4 h-4" />
 {discountPercent}% OFF
 </span>
 )}

 {isOutOfStock && (
 <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm z-20">
 <span className="px-6 py-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-sm rounded-2xl uppercase tracking-widest">
 Out of Stock
 </span>
 </div>
 )}
 </div>

 {/* Thumbnails */}
 {primaryImages.length > 1 && (
 <div className="flex items-center space-x-3 overflow-x-auto pb-2">
 {primaryImages.map((img, index) => (
 <button
 key={img.id || index}
 onClick={() => setSelectedImageIndex(index)}
 className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
 selectedImageIndex === index
 ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/25'
 : 'border-slate-800 opacity-60 hover:opacity-100'
 }`}
 >
 <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Product Details Sidebar */}
 <div className="space-y-6">
 <div>
 <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
 <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
 {product.category.name}
 </span>
 <span className="font-mono text-slate-500">SKU: {product.sku}</span>
 </div>

 <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{product.name}</h1>

 {/* Rating Summary Header */}
 <div className="flex items-center space-x-3 mt-3">
 <div className="flex items-center space-x-1 text-amber-400">
 {Array.from({ length: 5 }).map((_, i) => (
 <Star
 key={i}
 className={`w-4 h-4 ${
 i < Math.round(reviewSummary.ratingAvg || product.ratingAvg || 0)
 ? 'fill-amber-400 text-amber-400'
 : 'text-slate-700'
 }`}
 />
 ))}
 </div>
 <span className="text-sm font-bold text-slate-200">
 {reviewSummary.ratingAvg || product.ratingAvg || '0.0'}
 </span>
 <span className="text-xs text-slate-500">
 ({reviewSummary.totalReviews || product.ratingCount || 0} Customer Reviews)
 </span>
 </div>
 </div>

 {/* Pricing Block */}
 <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
 <span className="text-xs text-slate-400">Price</span>
 <div className="flex items-baseline space-x-3">
 {hasDiscount ? (
 <>
 <span className="text-3xl font-extrabold text-indigo-400">
 {formatRupiah(discountNum!)}
 </span>
 <span className="text-sm text-slate-500 line-through">
 {formatRupiah(priceNum)}
 </span>
 </>
 ) : (
 <span className="text-3xl font-extrabold text-white">{formatRupiah(priceNum)}</span>
 )}
 </div>
 </div>

 {/* Specifications */}
 <div className="grid grid-cols-2 gap-4 text-xs">
 <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3">
 <Scale className="w-5 h-5 text-slate-400" />
 <div>
 <p className="text-slate-500">Weight</p>
 <p className="font-bold text-slate-200">{product.weight} grams</p>
 </div>
 </div>

 <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3">
 <ShieldCheck className="w-5 h-5 text-emerald-400" />
 <div>
 <p className="text-slate-500">Stock Availability</p>
 <p className={`font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
 {isOutOfStock ? 'Out of Stock' : `${product.availableStock} Units Available`}
 </p>
 </div>
 </div>
 </div>

 {/* Quantity & Purchase Triggers */}
 {!isOutOfStock ? (
 <div className="space-y-4 pt-4 border-t border-slate-800">
 <div className="flex items-center space-x-4">
 <span className="text-xs font-semibold text-slate-300">Quantity:</span>
 <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
 <button
 onClick={() => setQuantity((q) => Math.max(1, q - 1))}
 className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
 >
 <Minus className="w-4 h-4" />
 </button>
 <span className="w-10 text-center font-bold text-sm text-white">{quantity}</span>
 <button
 onClick={() => setQuantity((q) => Math.min(product.availableStock, q + 1))}
 className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
 >
 <Plus className="w-4 h-4" />
 </button>
 </div>
 </div>

 {cartSuccess && (
 <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
 Added {quantity} unit(s) of {product.name} to cart!
 </div>
 )}

 <div className="grid grid-cols-2 gap-4">
 <button
 onClick={handleAddToCart}
 className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-sm border border-slate-700 flex items-center justify-center space-x-2 transition-all"
 >
 <ShoppingBag className="w-4 h-4 text-indigo-400" />
 <span>Add to Cart</span>
 </button>
 <button
 onClick={handleBuyNow}
 className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
 >
 <span>Buy Now</span>
 </button>
 </div>
 </div>
 ) : (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
 This product is currently out of stock. Please check back later.
 </div>
 )}

 {/* Description Section */}
 <div className="pt-6 border-t border-slate-800 space-y-3">
 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Overview</h3>
 <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>
 </div>
 </div>
 </div>

 {/* Customer Reviews & Rating Breakdown Section */}
 <div className="pt-12 border-t border-slate-800 space-y-8">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
 <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
 <span>Verified Customer Reviews</span>
 </h2>
 <p className="text-xs text-slate-400 mt-1">
 Feedback from verified buyers who purchased this product.
 </p>
 </div>

 {isAuthenticated && (
 <button
 onClick={() => {
 setIsReviewModalOpen(true);
 setReviewError('');
 }}
 className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 self-start sm:self-auto transition-all"
 >
 <MessageSquarePlus className="w-4 h-4" />
 <span>Write a Review</span>
 </button>
 )}
 </div>

 {/* Rating Overview & Star Graph */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
 {/* Average Box */}
 <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center space-y-2">
 <span className="text-5xl font-extrabold text-white font-mono">
 {reviewSummary.ratingAvg || '0.0'}
 </span>
 <div className="flex items-center space-x-1 text-amber-400">
 {Array.from({ length: 5 }).map((_, i) => (
 <Star
 key={i}
 className={`w-5 h-5 ${
 i < Math.round(reviewSummary.ratingAvg || 0)
 ? 'fill-amber-400 text-amber-400'
 : 'text-slate-800'
 }`}
 />
 ))}
 </div>
 <p className="text-xs text-slate-400">
 Based on {reviewSummary.totalReviews} verified ratings
 </p>
 </div>

 {/* Breakdown Bars */}
 <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
 {[5, 4, 3, 2, 1].map((stars) => {
 const count = reviewSummary.breakdown[stars] || 0;
 const percent = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
 return (
 <div key={stars} className="flex items-center space-x-3 text-xs">
 <span className="w-12 text-slate-400 font-medium flex items-center space-x-1">
 <span>{stars}</span>
 <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
 </span>
 <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className="h-full bg-amber-400 rounded-full transition-all duration-500"
 style={{ width: `${percent}%` }}
 />
 </div>
 <span className="w-8 text-right text-slate-500 font-mono text-[11px]">{count}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Reviews Feed */}
 <div className="space-y-4">
 {isLoadingReviews ? (
 <p className="text-xs text-slate-500">Loading customer reviews...</p>
 ) : reviewsList.length === 0 ? (
 <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-400 text-xs">
 No customer reviews yet. Be the first verified buyer to leave a review!
 </div>
 ) : (
 reviewsList.map((rev) => (
 <div
 key={rev.id}
 className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
 {rev.userName.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="text-xs font-semibold text-white flex items-center gap-2">
 <span>{rev.userName}</span>
 <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] flex items-center gap-1 font-mono">
 <CheckCircle className="w-3 h-3" /> Verified Buyer
 </span>
 </p>
 <p className="text-[10px] text-slate-500">
 {new Date(rev.createdAt).toLocaleDateString('id-ID', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 })}
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-1 text-amber-400">
 {Array.from({ length: 5 }).map((_, i) => (
 <Star
 key={i}
 className={`w-4 h-4 ${
 i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'
 }`}
 />
 ))}
 </div>
 </div>

 <p className="text-xs text-slate-300 leading-relaxed pl-1">{rev.comment}</p>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Write a Review Modal */}
 {isReviewModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
 <form
 onSubmit={handleReviewSubmit}
 className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6"
 >
 <div className="flex items-center justify-between pb-4 border-b border-slate-800">
 <div>
 <h3 className="font-bold text-white text-base flex items-center space-x-2">
 <MessageSquarePlus className="w-5 h-5 text-indigo-400" />
 <span>Submit Verified Product Review</span>
 </h3>
 <p className="text-xs text-slate-400 mt-1 line-clamp-1">{product.name}</p>
 </div>
 <button
 type="button"
 onClick={() => setIsReviewModalOpen(false)}
 className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {reviewError && (
 <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
 <AlertTriangle className="w-4 h-4 shrink-0" />
 <span>{reviewError}</span>
 </div>
 )}

 <div className="space-y-4 text-xs">
 {/* Select Order */}
 <div>
 <label className="block text-slate-300 font-semibold mb-1">
 Select Verified Purchase Order
 </label>
 {validPurchaseOrders.length === 0 ? (
 <p className="text-rose-400 text-[11px] bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
 No verified purchases found for this product. You can only review items you have bought.
 </p>
 ) : (
 <select
 value={selectedOrderId}
 onChange={(e) => setSelectedOrderId(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
 >
 <option value="">-- Choose Order --</option>
 {validPurchaseOrders.map((ord: any) => (
 <option key={ord.id} value={ord.id}>
 {ord.orderNumber} ({new Date(ord.createdAt).toLocaleDateString('id-ID')}) -{' '}
 {ord.orderStatus}
 </option>
 ))}
 </select>
 )}
 </div>

 {/* Star Rating Picker */}
 <div>
 <label className="block text-slate-300 font-semibold mb-2">Overall Star Rating</label>
 <div className="flex items-center space-x-2">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 type="button"
 key={star}
 onClick={() => setReviewRating(star)}
 className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
 >
 <Star
 className={`w-6 h-6 ${
 star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
 }`}
 />
 </button>
 ))}
 <span className="font-bold text-amber-400 text-sm ml-2 font-mono">
 {reviewRating} / 5 Stars
 </span>
 </div>
 </div>

 {/* Comment Textarea */}
 <div>
 <label className="block text-slate-300 font-semibold mb-1">Your Written Review</label>
 <textarea
 rows={4}
 placeholder="Tell us about the sound quality, material, performance, or overall satisfaction..."
 value={reviewComment}
 onChange={(e) => setReviewComment(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
 />
 </div>
 </div>

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
 <button
 type="button"
 onClick={() => setIsReviewModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={submitReviewMutation.isPending || validPurchaseOrders.length === 0}
 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
 >
 {submitReviewMutation.isPending ? 'Submitting...' : 'Post Verified Review'}
 </button>
 </div>
 </form>
 </div>
 )}
 </div>
 );
};

export default ProductDetailPage;
