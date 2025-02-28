import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup({ setIsAuthenticated }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (isSignUp) {
      data.fullName = formData.get('fullName');
    }

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Authentication failed');
        return;
      }

      if (result.token) {
        setIsAuthenticated(true);
        localStorage.setItem('token', result.token);
        navigate('/home');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error:', err);
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="logo">BUONO</h1>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="input-field"
              required
            />
          )}
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
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <button
          className="toggle-button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
        <button className="auth-button" onClick={handleAdminLogin}>
          Admin Login
        </button>
      </div>
    </div>
  );
}

export default Signup;