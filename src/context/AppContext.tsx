import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Interface User khớp 100% với DTO AuthUserResponse từ Backend Go
interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  login: (authData: { token: string; user: User }) => void; // Nhận User thật từ BE
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
      localStorage.removeItem('user'); // Dữ liệu rác thì xóa luôn cho sạch
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState<string>(() =>
    localStorage.getItem('token') ? 'feed' : 'login'
  );

  const isAuthenticated = !!token && !!user;

  // --- HÀNH ĐỘNG (ACTIONS) ---

  const login = (authData: { token: string; user: User }) => {
    // 1. Cập nhật State để React re-render toàn bộ app (Hiện nút Sửa/Xóa)
    setToken(authData.token);
    setUser(authData.user);

    // 2. Lưu vào "bộ nhớ dài hạn" để F5 không bị mất
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));

    // 3. Đá sang trang chủ
    setCurrentPage('feed');
  };

  const logout = () => {
    // 1. Xóa sạch dấu vết
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Đá về login
    setCurrentPage('login');
  };

  // --- BẢO VỆ (SECURITY MIDDLEWARE) ---
  useEffect(() => {
    // Nếu đang ở trang cần đăng nhập mà không có token -> Văng ra Login
    const publicPages = ['login', 'register'];
    if (!token && !publicPages.includes(currentPage)) {
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