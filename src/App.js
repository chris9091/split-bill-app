import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../src/components/AppRoutes'; // Import your routes configuration

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
