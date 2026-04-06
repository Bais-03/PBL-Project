import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (isMounted.current) {
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        if (isMounted.current) {
          setLoading(false);
        }
        return;
      }
      
      try {
        const response = await axios.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isMounted.current) {
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        
        // If token is invalid, logout
        if (err.response?.status === 401 && isMounted.current) {
          logout();
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [token, logout]);

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    if (isMounted.current) {
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, []);

  const value = {
    token,
    user,
    login,
    logout,
    loading,
    updateUser,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};