import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/Login';
import ConnectionsList from '../features/connections/ConnectionsList';
import ContactsList from '../features/contacts/ContactsList';
import MessagesList from '../features/messages/MessagesList';
import PrivateRoute from './guards/PrivateRoute';
import { MainLayout } from '../layouts/MainLayout';
import { ConnectionProvider } from './providers/ConnectionProvider';

export const AppRoutes: React.FC = () => {
  return (
    <ConnectionProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<ConnectionsList />} />
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/messages" element={<MessagesList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConnectionProvider>
  );
};
