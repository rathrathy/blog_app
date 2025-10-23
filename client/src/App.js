import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './components/home/Home';
import Login from './components/account/Login';
import CreatePost from './components/create/CreatePost';
import DataProvider from './context/DataProvider';

const PrivateRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? (
    <>
      <Header />
      {children || <Outlet />}
    </>
  ) : <Navigate replace to="/login" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <DataProvider>
      <div style={{ marginTop: 64 }}>
        <Routes>
          <Route path="/login" element={<Login onAuth={setIsAuthenticated} />} />
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <CreatePost />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </DataProvider>
  );
}

export default App;