import { useState, useEffect } from 'react';
import ConversationList from '../components/ConversationList';
import ChatBox from '../components/ChatBox';
import MainLayout from '../../../components/layout/MainLayout';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useApp } from '../../../context/AppContext';

export default function ChatLayout() {
  const { token } = useApp();
  const [selected, setSelected] = useState<any | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const WS_URL = token ? `ws://localhost:8080/api/v1/ws?token=${token}` : null;

  // 1. LẤY DANH SÁCH BAN ĐẦU
  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${BASE_URL}/users/following`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
          const usersList = Array.isArray(result) ? result : (result.data || []);
          const mapped = usersList.map((u: any) => ({
            id: u.id,
            user: { id: u.id, username: u.username, avatar_url: u.avatar_url },
            last_message: '',
            unread: 0
          }));
          setConversations(mapped);
        }
      } finally { setLoading(false); }
    };
    fetchContacts();
  }, [token]);

  // 2. HỨNG WEBSOCKET ĐỂ CẬP NHẬT SIDEBAR REAL-TIME
  const { latestData } = useWebSocket(WS_URL);

  useEffect(() => {
    if (!latestData) return;
    const data = latestData;
    if (data.type === 'NOTIFICATION') return; // Thông báo xử lý chỗ khác

    const msg = {
      from_id: data.from_user_id || data.FromUserID,
      content: data.content || data.Content,
    };

    setConversations((prev) => {
      return prev.map((conv) => {
        // Nếu tin nhắn tới từ người này và mình KHÔNG đang mở chat với họ
        if (String(conv.user.id) === String(msg.from_id)) {
          const isCurrentChat = selected?.user?.id === conv.user.id;
          return {
            ...conv,
            last_message: msg.content,
            unread: isCurrentChat ? 0 : conv.unread + 1 // Tăng số tin chưa đọc
          };
        }
        return conv;
      });
    });
  }, [latestData]);

  const handleSelect = (conv: any) => {
    setSelected(conv);
    setShowChat(true);
    // Khi bấm vào chat thì reset số tin chưa đọc về 0
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
  };

  return (
    <MainLayout hideRightWidgets>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 7rem)' }}>
        <div className="flex h-full">
          <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 h-full border-r border-gray-100 ${showChat ? 'hidden lg:flex' : 'flex'} flex-col`}>
            {/* Truyền conversations từ state xuống */}
            <ConversationList
              conversations={conversations}
              loading={loading}
              selectedId={selected?.id}
              onSelect={handleSelect}
            />
          </div>
          <div className={`flex-1 h-full ${showChat ? 'flex' : 'hidden lg:flex'} flex-col bg-gray-50/50`}>
            <ChatBox conversation={selected} onBack={() => setShowChat(false)} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}