import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (err) {
        console.error('Error parsing user info:', err);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Register user - ACTUALLY CALLS BACKEND
  const register = async (name, email, password) => {
    try {
      setError(null);
      console.log('Registering with backend:', { name, email });
      
      const response = await axios.post(`${API_URL}/users/register`, {
        name,
        email,
        password
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        // Return success - don't auto-login
        return { 
          success: true, 
          message: '✅ Registration successful! Please login.' 
        };
      }
      
      return { success: false, error: response.data.error || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || error.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login user - ACTUALLY CALLS BACKEND
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Logging in:', { email });
      
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || error.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const token = user?.token;
      const response = await axios.put(`${API_URL}/users/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: 'Update failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const isAdmin = () => user?.isAdmin === true;

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};