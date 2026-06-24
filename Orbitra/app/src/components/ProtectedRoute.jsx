import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { currentUser, userRole } = useAuth();

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // If a specific role is required and user doesn't have it, redirect to dashboard
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in and has required role (or no role required), render children
  return children;
};

export default ProtectedRoute;
