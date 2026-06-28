import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * Guards routes that require authentication
 * Redirects to login if user is not authenticated
 * Shows loading spinner while auth state is being determined
 */
const ProtectedRoute = ({
  element,
  requiredRoles = null,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check role-based access if required
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Return the protected component
  return element;
};

export default ProtectedRoute;
