import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Định nghĩa cấu trúc User từ Backend Go của cậu
interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
}

// 2. Định nghĩa kiểu dữ liệu cho Context
interface AppContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  login: (authData: { token: string; user: User }) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook để sử dụng context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Lấy dữ liệu từ localStorage lúc khởi tạo
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  // Logic khởi tạo trang hiện tại: nếu có token thì vào feed, không thì login
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const initialToken = localStorage.getItem('token');
    return initialToken ? 'feed' : 'login';
  });

  // Xử lý Login thành công
  const login = (authData: { token: string; user: User }) => {
    const { token: newToken, user: newUser } = authData;

    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setCurrentPage('feed');
  };

  // Xử lý Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setCurrentPage('login');
  };

  // Theo dõi sự thay đổi của token để đồng bộ trạng thái Login
  useEffect(() => {
    const isAuth = !!token;
    setIsAuthenticated(isAuth);

    // Nếu bỗng dưng mất token (vd: hết hạn) mà đang ở trang nội bộ thì đá ra login
    if (!isAuth && !['login', 'register'].includes(currentPage)) {
      setCurrentPage('login');
    }
  }, [token, currentPage]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        currentPage,
        setCurrentPage,
        login,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}