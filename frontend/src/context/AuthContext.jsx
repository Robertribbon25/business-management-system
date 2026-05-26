import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Setup API URL pointing to the combined server
const API_URL = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply authorization header globally on token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  // Verify token and load profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          setToken('');
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        setToken(''); // Reset stale tokens
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'sales') => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Logout handler
  const logout = () => {
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
