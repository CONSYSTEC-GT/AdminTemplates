import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Verificar si estamos en entorno de desarrollo local
  const isLocalDevelopment = process.env.NODE_ENV === 'development' && 
                            (window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1');

  // Permitir acceso directo en desarrollo local
  if (isLocalDevelopment) {
    return children;
  }

  // Para producción, mantener la lógica original de validación de token
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/login-required" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem('authToken');
      return <Navigate to="/login-required" state={{ from: location }} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('authToken');
    return <Navigate to="/login-required" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;