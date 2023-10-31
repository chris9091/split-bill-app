import React from 'react';
import { auth } from '../../firebase/firebase';

const Dashboard = () => {
  const handleLogout = () => {
    auth.signOut(); // Sign out the user
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
