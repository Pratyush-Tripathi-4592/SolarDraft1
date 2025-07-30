import axios from 'axios';
import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      boxSizing: 'border-box',
    },
    inputFocus: {
      borderColor: '#059669',
      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
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
    primaryButtonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed',
      boxShadow: 'none',
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
    error: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.375rem',
    },
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await axios.post('http://localhost:5000/api/user/login', {
        email,
        password,
      });
      
      // Handle successful login
      console.log('Login successful:', response.data);
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      // Navigate to profile page
      navigate('/profile');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/user/signup', {
        fullName,
        email,
        password,
      });
      
      // Handle successful signup
      console.log('Signup successful:', response.data);
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        navigate('/profile');
      } else {
        // If no auto-login, switch to login form
        setIsLogin(true);
        setError('Account created successfully! Please log in.');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      setError(
        error.response?.data?.message || 
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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

        {error && <div style={authStyles.error}>{error}</div>}

        {isLogin ? (
          <form style={authStyles.form} onSubmit={handleLoginSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              style={authStyles.input}
              onFocus={(e) => Object.assign(e.target.style, authStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              style={authStyles.input}
              onFocus={(e) => Object.assign(e.target.style, authStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...authStyles.button,
                ...(loading ? authStyles.primaryButtonDisabled : authStyles.primaryButton)
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form style={authStyles.form} onSubmit={handleSignupSubmit}>
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              required
              style={authStyles.input}
              onFocus={(e) => Object.assign(e.target.style, authStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              style={authStyles.input}
              onFocus={(e) => Object.assign(e.target.style, authStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              style={authStyles.input}
              onFocus={(e) => Object.assign(e.target.style, authStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              style={authStyles.input}
              onFocus={(e) => Object.assign(e.target.style, authStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...authStyles.button,
                ...(loading ? authStyles.primaryButtonDisabled : authStyles.primaryButton)
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
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
              setError(''); // Clear any errors when switching
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