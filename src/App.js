import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import AdminPortal from './components/AdminPortal';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={<Signup setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route 
            path="/admin-login" 
            element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route 
            path="/home" 
            element={isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />}
          />
          <Route 
            path="/admin-portal" 
            element={isAuthenticated ? <AdminPortal setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/admin-login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;