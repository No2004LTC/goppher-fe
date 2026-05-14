import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket'; // Nhớ check lại đường dẫn hook này

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
  
  // --- STATE CHAT ---
  friends: any[];
  strangers: any[];
  onlineMap: Record<string, boolean>; // Bản đồ Online
  isChatLoading: boolean;
  currentChatUserId: string | null;
  setFriends: React.Dispatch<React.SetStateAction<any[]>>;
  setStrangers: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentChatUserId: React.Dispatch<React.SetStateAction<string | null>>;
  
  unreadChatCount: number;
  unreadNotifCount: number;
  isNotifPanelOpen: boolean;
  latestData: any;
  wsConnected: boolean;
  
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadNotifCount: React.Dispatch<React.SetStateAction<number>>;
  setIsNotifPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!token && !!user;

  // --- KHO CHỨA DỮ LIỆU CHAT & ONLINE ---
  const [friends, setFriends] = useState<any[]>([]);
  const [strangers, setStrangers] = useState<any[]>([]);
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(null);

  // Dùng Ref để chống loop dependency
  const friendsRef = useRef(friends);
  const strangersRef = useRef(strangers);
  useEffect(() => { friendsRef.current = friends; }, [friends]);
  useEffect(() => { strangersRef.current = strangers; }, [strangers]);

  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState<boolean>(false);

  const BASE_HTTP_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const BASE_WS_URL = BASE_HTTP_URL.replace('http', 'ws');
  const WS_URL = token ? `${BASE_WS_URL}/ws?token=${token}` : null;

  // 🔌 GỌI HOOK WEBSOCKET TOÀN CỤC Ở ĐÂY
  const { latestData, isConnected: wsConnected } = useWebSocket(WS_URL);
  
  // Bộ đếm ngược tắt đèn
  const offlineTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // --- FETCH DANH SÁCH CHAT ---
  const refreshConversations = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_HTTP_URL}/chats/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        const rawFriends = result.friends || result.data?.friends || [];
        const rawStrangers = result.strangers || result.data?.strangers || [];
        const newOnlineMap: Record<string, boolean> = {};

        const mapConv = (u: any) => {
          const uid = String(u.partner_id || u.id);
          newOnlineMap[uid] = Boolean(u.is_online);
          return {
            ...u,
            id: uid,
            user: {
              id: uid,
              username: u.partner_username || u.username || 'Người dùng',
              avatar_url: u.partner_avatar_url || u.avatar_url || ''
            },
            last_message: u.last_message || '',
            last_message_at: u.last_message_at || new Date().toISOString(),
            unread: u.unread_count || u.unread || 0,
          };
        };

        setFriends(Array.isArray(rawFriends) ? rawFriends.map(mapConv) : []);
        setStrangers(Array.isArray(rawStrangers) ? rawStrangers.map(mapConv) : []);
        setOnlineMap(prev => ({ ...prev, ...newOnlineMap }));
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách chat:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setUnreadChatCount(0);
      setUnreadNotifCount(0);
      setFriends([]);
      setStrangers([]);
      setOnlineMap({});
      return;
    }
    refreshConversations();

    const fetchCounts = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [chatRes, notifRes] = await Promise.all([
          fetch(`${BASE_HTTP_URL}/chats/unread-count`, { headers }),
          fetch(`${BASE_HTTP_URL}/notifications/unread-count`, { headers })
        ]);
        if (chatRes.ok) {
          const res = await chatRes.json();
          setUnreadChatCount(res.unread_count ?? res.data?.unread_count ?? 0);
        }
        if (notifRes.ok) {
          const res = await notifRes.json();
          setUnreadNotifCount(res.unread_count ?? res.data?.unread_count ?? 0);
        }
      } catch (error) { }
    };
    fetchCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // --- HỨNG TIN NHẮN TỪ WEBSOCKET ---
  useEffect(() => {
    if (!latestData) return;

    // 1. LUỒNG BẢN ĐỒ ONLINE (Kỹ thuật trễ 2.5s)
    if (latestData.type === 'USER_STATUS_CHANGE') {
      const { user_id, status } = latestData.data;
      const isOnline = status === 'online';
      const uid = String(user_id);

      if (isOnline) {
        if (offlineTimers.current[uid]) {
          clearTimeout(offlineTimers.current[uid]);
          delete offlineTimers.current[uid];
        }
        setOnlineMap(prev => ({ ...prev, [uid]: true }));
      } else {
        if (offlineTimers.current[uid]) clearTimeout(offlineTimers.current[uid]);
        offlineTimers.current[uid] = setTimeout(() => {
          setOnlineMap(prev => ({ ...prev, [uid]: false }));
          delete offlineTimers.current[uid];
        }, 2500);
      }
      return; 
    }

    // 2. LUỒNG TIN NHẮN MỚI
    const isWrapped = latestData.type === 'NEW_MESSAGE';
    const contentCheck = latestData.content || latestData.Content || latestData.message;

    if (isWrapped || contentCheck) {
      const msg = isWrapped ? latestData.data : latestData;
      const senderID = String(msg.from_user_id || msg.FromUserID || msg.sender_id || msg.SenderID);
      const content = msg.content || msg.Content || msg.message;
      const createdAt = msg.created_at || msg.CreatedAt || new Date().toISOString();

      const isMe = String(user?.id) === senderID;
      const allContacts = [...friendsRef.current, ...strangersRef.current];
      const senderExists = allContacts.some(c => String(c.user.id) === senderID);

      if (!senderExists && !isMe) {
        refreshConversations();
        return;
      }

      const processUpdate = (prevList: any[]) => {
        const existingIndex = prevList.findIndex(c => String(c.user.id) === String(senderID));
        if (existingIndex !== -1) {
          const updatedConv = {
            ...prevList[existingIndex],
            last_message: content,
            last_message_at: createdAt,
            unread: currentChatUserId === senderID ? 0 : (prevList[existingIndex].unread || 0) + 1
          };
          const remainList = prevList.filter((_, i) => i !== existingIndex);
          return [updatedConv, ...remainList];
        }
        return prevList;
      };

      setFriends(prev => processUpdate(prev));
      setStrangers(prev => processUpdate(prev));
    }
  }, [latestData, currentChatUserId, user?.id]);

  const login = (authData: { token: string; user: User }) => {
    setToken(authData.token);
    setUserState(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.clear();
    window.location.replace('/login');
  };

  const updateUser = (data: Partial<User>) => {
    setUserState((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user, token, isAuthenticated,
        friends, strangers, onlineMap, isChatLoading, currentChatUserId,
        setFriends, setStrangers, setCurrentChatUserId,
        unreadChatCount, unreadNotifCount, isNotifPanelOpen,
        latestData, wsConnected,
        setUnreadChatCount, setUnreadNotifCount, setIsNotifPanelOpen,
        setUser: setUserState, updateUser, login, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}