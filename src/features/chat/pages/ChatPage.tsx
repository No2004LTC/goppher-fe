import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '../components/ConversationList';
import ChatBox from '../components/ChatBox';
import MainLayout from '../../../components/layout/MainLayout';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useApp } from '../../../context/AppContext';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const toUserId = searchParams.get('to_user');

  const { token, setUnreadChatCount } = useApp();
  const [selected, setSelected] = useState<any | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);

  const [friends, setFriends] = useState<any[]>([]);
  const [strangers, setStrangers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const WS_URL = token ? `ws://localhost:8080/api/v1/ws?token=${token}` : null;

  // HỨNG WEBSOCKET 1 LẦN DUY NHẤT Ở ĐÂY
  const { latestData } = useWebSocket(WS_URL);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${BASE_URL}/chats/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
          const mapConv = (u: any) => ({
            id: u.partner_id || u.id,
            user: {
              id: u.partner_id || u.id,
              username: u.partner_username || u.username,
              avatar_url: u.partner_avatar_url || u.avatar_url
            },
            last_message: u.last_message || '',
            last_message_at: u.last_message_at,
            unread: u.unread_count || 0,
            is_online: Boolean(u.is_online)
          });
          const rawFriends = result.data?.friends || [];
          const rawStrangers = result.data?.strangers || [];

          let f = rawFriends.map(mapConv);
          let s = rawStrangers.map(mapConv);

          // TÍNH NĂNG MỞ CHAT VỚI NGƯỜI LẠ BẰNG ID ĐÃ ĐƯỢC FIX LỖI API
          if (toUserId) {
            const allConvs = [...f, ...s];
            const target = allConvs.find(c => String(c.user.id) === String(toUserId));
            if (target) {
              setSelected(target);
              setShowChat(true);
            } else {
              // Gọi đúng API mới viết ở BE
              fetch(`${BASE_URL}/users/id/${toUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
                .then(res => res.json())
                .then(data => {
                  if (data.data) {
                    const newConv = {
                      id: data.data.id,
                      user: { id: data.data.id, username: data.data.username, avatar_url: data.data.avatar_url },
                      last_message: '',
                      unread: 0,
                      is_online: false
                    };
                    s = [newConv, ...s];
                    setStrangers(s); // Ép update giao diện
                    setSelected(newConv);
                    setShowChat(true);
                  }
                });
            }
          }

          setFriends(f);
          setStrangers(s);
        }
      } finally { setLoading(false); }
    };
    fetchContacts();
  }, [token, toUserId, BASE_URL]);

  // UPDATE UI KHI CÓ TIN NHẮN TỪ WEBSOCKET
  useEffect(() => {
    if (!latestData) return;
    const data = latestData.data || latestData; // Đảm bảo lấy đúng data
    if (latestData.type === 'NOTIFICATION') return;

    const msg = {
      from_id: data.from_user_id || data.FromUserID,
      content: data.content || data.Content,
    };

    const updateConvList = (prev: any[]) => prev.map((conv) => {
      if (String(conv.user.id) === String(msg.from_id)) {
        const isCurrentChat = selected?.user?.id === conv.user.id;
        return {
          ...conv,
          last_message: msg.content,
          last_message_at: new Date().toISOString(),
          unread: isCurrentChat ? 0 : conv.unread + 1
        };
      }
      return conv;
    });

    setFriends(updateConvList);
    setStrangers(updateConvList);
  }, [latestData, selected]);

  const handleSelect = async (conv: any) => {
    setSelected(conv);
    setShowChat(true);

    if (conv.unread > 0) {
      setFriends(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
      setStrangers(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
      setUnreadChatCount((prev: number) => Math.max(0, prev - conv.unread));

      try {
        await fetch(`${BASE_URL}/chats/${conv.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái đã đọc:", error);
      }
    }
  };

  return (
    <MainLayout hideRightWidgets fullHeightContent>
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-3rem)]"
        id="chat-container"
      >
        <div className="flex h-full">
          <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 h-full border-r border-gray-100 ${showChat ? 'hidden lg:flex' : 'flex'} flex-col`}>
            <ConversationList
              friends={friends}
              strangers={strangers}
              loading={loading}
              selectedId={selected?.id}
              onSelect={handleSelect}
            />
          </div>
          <div className={`flex-1 h-full ${showChat ? 'flex' : 'hidden lg:flex'} flex-col bg-gray-50/50`}>
            {/* TRUYỀN THẲNG latestData XUỐNG CHATBOX ĐỂ CHỐNG XUNG ĐỘT */}
            <ChatBox
              conversation={selected}
              onBack={() => setShowChat(false)}
              incomingMessage={latestData}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}