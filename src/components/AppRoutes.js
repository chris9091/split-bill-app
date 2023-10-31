import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../components/Auth/login';
import SignUp from '../components/Auth/SignUp';
import Dashboard from '../components/user/Dashboard';
import AdminDashboard from '../components/admin/AdminDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default AppRoutes;
