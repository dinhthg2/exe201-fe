"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (t && u) {
        setToken(t);
        try { setUser(JSON.parse(u)); } catch {}
      }
    } finally { setInitializing(false); }
  }, []);

  const login = async (email, password, role) => {
    const payload = { email, password };
    // Don't send role - let backend determine it from the user account
    try {
      console.debug('[AuthContext] api baseURL:', api.defaults?.baseURL);
      console.debug('[AuthContext] login payload:', payload);
      const res = await api.post('/auth/login', payload);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user; // Return user info for role-based routing
    } catch (err) {
      console.error('[AuthContext] login error:', err?.response?.status, err?.response?.data || err.message);
      throw err;
    }
  };

  const register = async (data) => {
    await api.post('/auth/register', data);
    await login(data.email, data.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
