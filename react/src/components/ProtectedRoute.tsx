import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  // Vérifier l'expiration du token (si JWT)
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const exp = payload.exp;
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return exp > now; // token valide si expiration > maintenant
  } catch {
    return false;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isTokenValid()) {
    localStorage.clear(); 
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
