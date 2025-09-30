import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const isLocalDevelopment = process.env.NODE_ENV === 'development' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isLocalDevelopment) {
    return children;
  }

  const token = sessionStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/login-required" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      sessionStorage.removeItem('authToken');
      return <Navigate to="/login-required" state={{ from: location }} replace />;
    }

    return children;
  } catch (error) {
    sessionStorage.removeItem('authToken');
    return <Navigate to="/login-required" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;