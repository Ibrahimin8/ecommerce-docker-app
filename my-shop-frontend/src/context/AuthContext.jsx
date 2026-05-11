import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for existing session on page load/refresh
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Path matches your backend userRoute: router.get('/profile'...)
          const res = await API.get('/users/profile');
          setUser(res.data);
        } catch (err) {
          console.error("Session expired or invalid token");
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // 2. Updated Login Function (Handles the API call itself)
  const login = async (email, password) => {
    try {
      // Path matches your backend authRoute: router.post('/login'...)
      const res = await API.post('/auth/login', { email, password });

      // Destructure data from your successful backend response
      const { token, user: userData } = res.data;

      // Only set state if the server returns a 200 OK
      localStorage.setItem('token', token);
      setUser(userData);

      return res.data;
    } catch (err) {
      // Clear state on failure so no "fake" user is saved
      localStorage.removeItem('token');
      setUser(null);
      // Throw error back to Login.jsx to show the toast message
      throw err;
    }
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Helper values - Updated isAdmin to handle 'admin' or 'administrator'
  const isCustomer = user?.role === 'user';
  const isAdmin = user?.role === 'administrator' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      isAdmin, 
      isCustomer, 
      login, 
      logout 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};