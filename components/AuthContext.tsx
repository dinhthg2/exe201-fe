"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

// Using JSDoc for lightweight typing without TS generics (avoids build issues if tsconfig missing)
/** @type {React.Context<any>} */
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      console.log('AuthContext init:', { hasToken: !!t, hasUser: !!u, tokenLength: t?.length, userLength: u?.length });
      
      if (t && u) {
        setToken(t);
        try { 
          const userData = JSON.parse(u);
          setUser(userData);
          console.log('User loaded from localStorage:', userData);
        } catch (e) {
          console.error('Failed to parse user data:', e);
          localStorage.removeItem('user');
        }
      } else {
        console.log('No token or user in localStorage');
      }
    } catch (e) {
      console.error('AuthContext useEffect error:', e);
    } finally {
      setInitializing(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const register = async (data) => {
    await api.post('/auth/register', data);
    await login(data.email, data.password);
  };

  const updateUser = (updatedUserData) => {
    console.log('AuthContext updateUser called with:', updatedUserData);
    console.log('Previous user data:', user);
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    console.log('User updated in AuthContext successfully');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      token: null,
      initializing: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      updateUser: () => {}
    };
  }
  return ctx;
};
