import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

// API base URL
const API_URL = "/api";

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set authorization header whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");

      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
    }
  }, [token]);

  // Verify token and fetch user profile
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
          setToken("");
        }
      } catch (err) {
        console.error("Failed to verify token:", err);

        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);

        return true;
      }

      return false;
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "Login failed. Please check credentials.";

      setError(errMsg);

      throw new Error(errMsg);
    }
  };

  // Register function
  const register = async (
    name,
    email,
    password,
    role = "sales"
  ) => {
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
      });

      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);

        return true;
      }

      return false;
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "Registration failed.";

      setError(errMsg);

      throw new Error(errMsg);
    }
  };

  // Logout function
  const logout = () => {
    setToken("");
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;