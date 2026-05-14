import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import ConversationList from '../components/ConversationList';
import ChatBox from '../components/ChatBox';
import MainLayout from '../../../components/layout/MainLayout';
import { useApp } from '../../../context/AppContext';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const toUserId = searchParams.get('to_user');

  // 🚀 LẤY TẤT CẢ TỪ APP CONTEXT (Nóc nhà)
  const { 
    token, 
    friends, setFriends, 
    strangers, setStrangers, 
    isChatLoading, 
    setUnreadChatCount,
    setCurrentChatUserId, 
    latestData 
  } = useApp();

  // 🚀 CHỈ LƯU ID: Kỹ thuật chống lỗi "Fake Offline"
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [initialTab, setInitialTab] = useState<'friends' | 'strangers'>('friends');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 🚀 TỰ ĐỘNG LẤY DATA MỚI NHẤT DỰA TRÊN ID
  const selectedConversation = useMemo(() => {
    if (!selectedId) return null;
    const all = [...friends, ...strangers];
    return all.find(c => String(c.user.id) === String(selectedId)) || null;
  }, [selectedId, friends, strangers]);

  // XỬ LÝ KHI NHẢY TỪ TRANG KHÁC VÀO CHAT (Qua state hoặc URL)
  useEffect(() => {
    if (isChatLoading) return;

    const stateData = location.state as any;
    const targetUserFromState = stateData?.targetUser;
    
    if (targetUserFromState) {
      if (stateData?.forceTab) setInitialTab(stateData.forceTab);

      const all = [...friends, ...strangers];
      let targetConv = all.find(c => String(c.user.id) === String(targetUserFromState.id));

      if (!targetConv) {
        targetConv = {
          id: targetUserFromState.id,
          user: {
            id: targetUserFromState.id,
            username: targetUserFromState.username,
            avatar_url: targetUserFromState.avatar_url,
          },
          last_message: '',
          last_message_at: new Date().toISOString(),
          unread: 0,
          is_online: false
        };
        setStrangers((prev: any[]) => [targetConv, ...prev]);
      }

      handleSelect(targetConv);
      window.history.replaceState({}, document.title);
    } 
    else if (toUserId) {
      const all = [...friends, ...strangers];
      let targetConv = all.find(c => String(c.user.id) === String(toUserId));
      
      if (targetConv) {
        handleSelect(targetConv);
      } else {
        // Nếu không có trong list, gọi API lấy info user đó
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
                last_message_at: new Date().toISOString(),
                unread: 0,
                is_online: false
              };
              setStrangers(prev => [newConv, ...prev]);
              handleSelect(newConv);
            }
          })
          .catch(err => console.error("Lỗi lấy thông tin user lạ:", err));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatLoading, location.state, toUserId, token, BASE_URL]);

  const handleSelect = async (conv: any) => {
    setSelectedId(String(conv.user.id));
    setShowChat(true);
    setCurrentChatUserId(String(conv.user.id));

    if (conv.unread > 0) {
      setUnreadChatCount((prev: number) => Math.max(0, prev - conv.unread));
      
      const resetUnread = (list: any[]) => list.map(c =>
        String(c.user.id) === String(conv.user.id) ? { ...c, unread: 0 } : c
      );
      setFriends((prev: any[]) => resetUnread(prev));
      setStrangers((prev: any[]) => resetUnread(prev));

      try {
        await fetch(`${BASE_URL}/chats/${conv.user.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) { }
    }
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedId(null);
    setCurrentChatUserId(null);
  };

  // Reset current chat user khi rời khỏi trang
  useEffect(() => {
    return () => setCurrentChatUserId(null);
  }, [setCurrentChatUserId]);

  return (
    <MainLayout hideRightWidgets fullHeightContent>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-3rem)]">
        <div className="flex h-full">
          <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 h-full border-r border-gray-100 ${showChat ? 'hidden lg:flex' : 'flex'} flex-col`}>
            <ConversationList
              friends={friends}
              strangers={strangers}
              loading={isChatLoading}
              selectedId={selectedId} // Chuyền ID xuống
              onSelect={handleSelect}
              defaultTab={initialTab}
            />
          </div>

          <div className={`flex-1 h-full ${showChat ? 'flex' : 'hidden lg:flex'} flex-col bg-gray-50/50`}>
            <ChatBox
              conversation={selectedConversation} // Truyền object đã update
              onBack={handleBack}
              incomingMessage={latestData}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}