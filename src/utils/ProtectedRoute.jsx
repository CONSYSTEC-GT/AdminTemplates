import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();

  const isLocalDevelopment = process.env.NODE_ENV === 'development' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isLocalDevelopment) return <Outlet />;

  const token = sessionStorage.getItem('authToken');
  if (!token) return <Navigate to="/login-required" state={{ from: location }} replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      sessionStorage.removeItem('authToken');
      return <Navigate to="/login-required" state={{ from: location }} replace />;
    }
    return <Outlet />;
  } catch {
    sessionStorage.removeItem('authToken');
    return <Navigate to="/login-required" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;