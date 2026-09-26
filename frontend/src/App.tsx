import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { AddressBookPage } from './pages/AddressBookPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 refetchOnWindowFocus: false,
 retry: 1,
 },
 },
});

export const App: React.FC = () => {
 return (
 <QueryClientProvider client={queryClient}>
 <AuthProvider>
 <CartProvider>
 <Router>
 <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
 <Navbar />
 <CartDrawer />
 <main className="flex-grow">
 <Routes>
 {/* Public Storefront Routes */}
 <Route path="/" element={<HomePage />} />
 <Route path="/catalog" element={<CatalogPage />} />
 <Route path="/products/:slug" element={<ProductDetailPage />} />
 <Route path="/login" element={<LoginPage />} />
 <Route path="/register" element={<RegisterPage />} />
 <Route path="/unauthorized" element={<UnauthorizedPage />} />

 {/* Customer Protected Routes */}
 <Route
 path="/cart"
 element={
 <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
 <CartPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/addresses"
 element={
 <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
 <AddressBookPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/checkout"
 element={
 <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
 <CheckoutPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/orders"
 element={
 <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
 <OrdersPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/orders/:id"
 element={
 <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
 <OrderDetailPage />
 </ProtectedRoute>
 }
 />

 {/* Protected Admin Routes */}
 <Route
 path="/admin/dashboard"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <DashboardPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/admin/products"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <AdminProductsPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/admin/inventory"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <AdminInventoryPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/admin/orders"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <AdminOrdersPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/admin/customers"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <AdminCustomersPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/admin/promotions"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <AdminPromotionsPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/admin/analytics"
 element={
 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
 <AdminAnalyticsPage />
 </ProtectedRoute>
 }
 />

 {/* Catch-all 404 Route */}
 <Route
 path="*"
 element={
 <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
 <div>
 <h2 className="text-4xl font-extrabold text-white">404</h2>
 <p className="text-sm text-slate-400 mt-2">Page requested could not be found.</p>
 </div>
 </div>
 }
 />
 </Routes>
 </main>
 <Footer />
 </div>
 </Router>
 </CartProvider>
 </AuthProvider>
 </QueryClientProvider>
 );
};

export default App;
