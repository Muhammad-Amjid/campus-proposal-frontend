import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Wraps a page and only renders it if the user is logged in (and has an allowed role, if specified)
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading } = useContext(AuthContext);

  // Still checking localStorage on first load — don't redirect prematurely
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  // Not logged in at all — send to Login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Logged in, but wrong role for this specific page — send to their own dashboard instead
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath =
      user.role === 'student'
        ? '/student-dashboard'
        : user.role === 'supervisor'
        ? '/supervisor-dashboard'
        : '/admin-dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}