import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Interface User khớp 100% với DTO AuthUserResponse từ Backend Go
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  bio?: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (authData: { token: string; user: User }) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export function AppProvider({ children }: { children: ReactNode }) {
  // --- KHO CHỨA DỮ LIỆU ---
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const isAuthenticated = !!token && !!user;

  // --- HÀNH ĐỘNG (ACTIONS) ---
  // Navigation (navigate) sẽ được truyền vào từ bên ngoài qua các hook của react-router-dom
  // vì AppProvider không nằm trong router context

  const login = (authData: { token: string; user: User }) => {
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    // Navigation được xử lý tại LoginPage sau khi gọi login()
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigation được xử lý tại component gọi logout()
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}