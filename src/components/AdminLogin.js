import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function AdminLogin({ setIsAuthenticated }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('http://localhost:8000/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Admin login failed');
        return;
      }

      if (result.token && result.isAdmin) {
        setIsAuthenticated(true);
        localStorage.setItem('token', result.token);
        navigate('/admin-portal');
      } else {
        setError('Not authorized as admin');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="logo">BUONO</h1>
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            required
          />
          <button type="submit" className="auth-button">
            Admin Login
          </button>
        </form>
        <button className="toggle-button" onClick={() => navigate('/')}>
          Back to User Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;