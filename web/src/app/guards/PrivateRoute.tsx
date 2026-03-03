import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
