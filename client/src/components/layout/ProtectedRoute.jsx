import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, userProfile } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
