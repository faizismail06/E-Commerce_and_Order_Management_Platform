import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types/auth';

interface ProtectedRouteProps {
 children: React.ReactNode;
 allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
 children,
 allowedRoles,
}) => {
 const { isAuthenticated, user, isLoading } = useAuth();
 const location = useLocation();

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
 <div className="flex flex-col items-center space-y-4">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
 <p className="text-sm font-medium tracking-wide animate-pulse">Authenticating user...</p>
 </div>
 </div>
 );
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 if (allowedRoles && user && !allowedRoles.includes(user.role)) {
 return <Navigate to="/unauthorized" replace />;
 }

 return <>{children}</>;
};
