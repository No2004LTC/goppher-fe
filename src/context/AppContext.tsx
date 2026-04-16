import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  unreadChatCount: number;
  unreadNotifCount: number;
  isNotifPanelOpen: boolean;
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadNotifCount: React.Dispatch<React.SetStateAction<number>>;
  setIsNotifPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState<boolean>(false);

  // --- GET GLOBAL UNREAD COUNTS ON STARTUP ---
  useEffect(() => {
    if (!isAuthenticated || !token) {
        setUnreadChatCount(0);
        setUnreadNotifCount(0);
        return;
    }

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

    const fetchCounts = async () => {
      try {
        const [chatRes, notifRes] = await Promise.all([
          fetch(`${BASE_URL}/chats/unread-count`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${BASE_URL}/notifications/unread-count`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setUnreadChatCount(chatData.data?.unread_count || 0);
        }

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setUnreadNotifCount(notifData.data?.unread_count || 0);
        }
      } catch (error) {
        console.error("Lỗi fetch global counts:", error);
      }
    };

    fetchCounts();
  }, [isAuthenticated, token]);

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
        unreadChatCount,
        unreadNotifCount,
        isNotifPanelOpen,
        setUnreadChatCount,
        setUnreadNotifCount,
        setIsNotifPanelOpen,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}