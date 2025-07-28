import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Создаем мокового пользователя-администратора
  const defaultUser: User = {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@spr.com',
    role: 'admin'
  };

  const [user] = useState<User>(defaultUser);
  const [isAuthenticated] = useState(true);

  const login = (token: string, user: User) => {
    // Ничего не делаем, так как пользователь всегда авторизован
  };

  const logout = () => {
    // Ничего не делаем, так как пользователь всегда авторизован
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 