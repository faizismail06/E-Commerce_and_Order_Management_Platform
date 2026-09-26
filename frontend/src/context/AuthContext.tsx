import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { api } from '../api/axios';

interface AuthContextType {
 user: User | null;
 token: string | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 login: (token: string, user: User) => void;
 logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [user, setUser] = useState<User | null>(() => {
 const savedUser = localStorage.getItem('user');
 return savedUser ? JSON.parse(savedUser) : null;
 });
 const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
 const [isLoading, setIsLoading] = useState<boolean>(true);

 useEffect(() => {
 const fetchMe = async () => {
 if (!token) {
 setIsLoading(false);
 return;
 }
 try {
 const response = await api.get('/auth/me');
 if (response.data?.success) {
 const userData = response.data.data;
 setUser(userData);
 localStorage.setItem('user', JSON.stringify(userData));
 }
 } catch (err) {
 console.error('Failed to restore session:', err);
 logout();
 } finally {
 setIsLoading(false);
 }
 };

 fetchMe();
 }, [token]);

 const login = (newToken: string, newUser: User) => {
 setToken(newToken);
 setUser(newUser);
 localStorage.setItem('token', newToken);
 localStorage.setItem('user', JSON.stringify(newUser));
 };

 const logout = () => {
 setToken(null);
 setUser(null);
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 };

 return (
 <AuthContext.Provider
 value={{
 user,
 token,
 isAuthenticated: !!user && !!token,
 isLoading,
 login,
 logout,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};
