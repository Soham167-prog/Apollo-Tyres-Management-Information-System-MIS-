import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

export type UserRole = 'admin' | 'manager' | 'employee';

interface User {
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

interface LoginResponse {
  user: {
    user_id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    return api
      .post<LoginResponse>('/login', { username, password })
      .then((res) => {
        setUser({
          username: res.user.email,
          role: res.user.role,
          name: res.user.name,
        });
        return true;
      })
      .catch(() => false);
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
