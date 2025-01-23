// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correctly import as named import

const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const decodedToken = jwtDecode(token);
  return decodedToken.user.role;
};

const ProtectedRoute = ({ roles }) => {
  const role = getUserRole();

  if (!role || !roles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
