import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  // Check if the user is authenticated, replace this logic with your authentication check
  const isAuthenticated = auth.currentUser !== null;

  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/login" replace />}
    />
  );
};

export default PrivateRoute;
