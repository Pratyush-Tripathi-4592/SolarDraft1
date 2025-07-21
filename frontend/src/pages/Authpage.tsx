import axios from 'axios';
import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const handleLoginSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await axios.post('http://localhost:5000/api/user/login', {
              email: e.target.email.value,
              password: e.target.password.value,
          });
          // Handle successful login
      } catch (error) {
          console.error("Login failed:", error);
          // Handle error
      }
};

const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/api/user/signup', {
            email: e.target.email.value,
            password: e.target.password.value,
        });
        // Handle successful signup
    } catch (error) {
        console.error("Signup failed:", error);
        // Handle error
    }
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const navigate = useNavigate(); // Initialize useNavigate

  const authStyles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '2rem',
    },
    logoIcon: {
      width: '2.5rem',
      height: '2.5rem',
      background: 'linear-gradient(135deg, #22c55e, #059669)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },
    logoText: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #166534, #059669)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '1.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    input: {
      width: '100%',
      padding: '0.8rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      outline: 'none',
    },
    button: {
      padding: '0.8rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
    },
    primaryButton: {
      background: 'linear-gradient(90deg, #22c55e, #059669)',
      color: 'white',
      boxShadow: '0 5px 15px rgba(34, 197, 94, 0.3)',
    },
    toggleText: {
      marginTop: '1.5rem',
      color: '#4b5563',
      fontSize: '0.9rem',
    },
    toggleLink: {
      color: '#059669',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none',
      marginLeft: '0.3rem',
    },
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Implement login logic here
    alert('Login form submitted!');
    // Navigate to Profile page on successful login
    navigate('/profile');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    // Implement signup logic here
    alert('Signup form submitted!');
    // Example: Call an API, create user
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.logo}>
          <div style={authStyles.logoIcon}>
            <Zap style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <span style={authStyles.logoText}>GreenGrid</span>
        </div>

        <h2 style={authStyles.title}>
          {isLogin ? 'Login to Your Account' : 'Create Your Account'}
        </h2>

        {isLogin ? (
          <form style={authStyles.form} onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              required
              style={authStyles.input}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={authStyles.input}
            />
            <button type="submit" style={{ ...authStyles.button, ...authStyles.primaryButton }}>
              Login
            </button>
          </form>
        ) : (
          <form style={authStyles.form} onSubmit={handleSignupSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              required
              style={authStyles.input}
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              style={authStyles.input}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={authStyles.input}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              style={authStyles.input}
            />
            <button type="submit" style={{ ...authStyles.button, ...authStyles.primaryButton }}>
              Sign Up
            </button>
          </form>
        )}

        <p style={authStyles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsLogin(!isLogin);
            }}
            style={authStyles.toggleLink}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
