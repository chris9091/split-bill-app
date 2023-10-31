import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/login';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/user/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Navbar from './components/Shared/Navbar';
import PrivateRoute from './components/Shared/PrivateRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <PrivateRoute path="/dashboard" element={<Dashboard />} />
        <PrivateRoute path="/admin" element={<AdminDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
