import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import api from '../hooks/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {

    try {
      const res = await api.get('/account/user/');
      console.log(res)
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      await api.post('/account/login/', { username, password });
      await checkAuth();
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/account/logout/');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = () => {
    checkAuth();
  };


  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    updateUser,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);