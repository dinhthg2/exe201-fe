'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getJson } from '../api';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  studentCode: string;
  major: string;
  semester?: number;
  specialization?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getJson<User>('/profile/me');
      setUser(userData);
    } catch (err) {
      setError('Không thể tải thông tin người dùng');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser: fetchUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}