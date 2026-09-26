import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/cart';
import { Cart } from '../types/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
 cart: Cart | null;
 isLoading: boolean;
 isDrawerOpen: boolean;
 setIsDrawerOpen: (open: boolean) => void;
 addToCart: (productId: string, quantity?: number, openDrawer?: boolean) => Promise<void>;
 updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
 removeItem: (itemId: string) => Promise<void>;
 clearUserCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { isAuthenticated } = useAuth();
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 const queryClient = useQueryClient();

 const { data: cart = null, isLoading } = useQuery({
 queryKey: ['cart'],
 queryFn: fetchCart,
 enabled: isAuthenticated,
 });

 const addToCartMutation = useMutation({
 mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
 apiAddToCart(productId, quantity),
 onSuccess: (newCart) => {
 queryClient.setQueryData(['cart'], newCart);
 },
 });

 const updateQuantityMutation = useMutation({
 mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
 apiUpdateCartItem(itemId, quantity),
 onSuccess: (newCart) => {
 queryClient.setQueryData(['cart'], newCart);
 },
 });

 const removeItemMutation = useMutation({
 mutationFn: (itemId: string) => apiRemoveCartItem(itemId),
 onSuccess: (newCart) => {
 queryClient.setQueryData(['cart'], newCart);
 },
 });

 const clearCartMutation = useMutation({
 mutationFn: apiClearCart,
 onSuccess: (newCart) => {
 queryClient.setQueryData(['cart'], newCart);
 },
 });

 const handleAddToCart = async (productId: string, quantity = 1, openDrawer = false) => {
 if (!isAuthenticated) {
 window.location.href = '/login';
 return;
 }
 await addToCartMutation.mutateAsync({ productId, quantity });
 if (openDrawer) {
 setIsDrawerOpen(true);
 }
 };

 const handleUpdateItemQuantity = async (itemId: string, quantity: number) => {
 if (quantity <= 0) {
 await removeItemMutation.mutateAsync(itemId);
 } else {
 await updateQuantityMutation.mutateAsync({ itemId, quantity });
 }
 };

 const handleRemoveItem = async (itemId: string) => {
 await removeItemMutation.mutateAsync(itemId);
 };

 const handleClearCart = async () => {
 await clearCartMutation.mutateAsync();
 };

 return (
 <CartContext.Provider
 value={{
 cart,
 isLoading,
 isDrawerOpen,
 setIsDrawerOpen,
 addToCart: handleAddToCart,
 updateItemQuantity: handleUpdateItemQuantity,
 removeItem: handleRemoveItem,
 clearUserCart: handleClearCart,
 }}
 >
 {children}
 </CartContext.Provider>
 );
};

export const useCart = () => {
 const context = useContext(CartContext);
 if (!context) {
 throw new Error('useCart must be used within a CartProvider');
 }
 return context;
};
