import React from 'react';
import { auth } from '../../firebase/firebase';

const AdminDashboard = () => {
  const handleLogout = () => {
    auth.signOut(); // Sign out the admin
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
