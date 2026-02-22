import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI, tokenService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenService.getToken();
    if (token) {
      authAPI.getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          tokenService.removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await authAPI.login(username, password);
    tokenService.setToken(data.token);
    const userData = await authAPI.getProfile();
    setUser(userData);
    return data;
  };

  const signup = async (username, email, password) => {
    return authAPI.signup(username, email, password);
  };

  const logout = () => {
    tokenService.removeToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
