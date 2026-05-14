import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { useApp } from '../../../context/AppContext';

export default function ChatBox({ conversation, onBack, incomingMessage }: any) {
  // 🚀 KÉO onlineMap TỪ TRẠM PHÁT SÓNG VỀ
  const { token, user: currentUser, onlineMap } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 1. LẤY LỊCH SỬ CHAT
  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversation?.user?.id || !token) return;
      try {
        const response = await fetch(`${BASE_URL}/chats/${conversation.user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
          let history = Array.isArray(result) ? result : (result.data || []);
          history = history.map((msg: any) => ({
            id: msg.id || msg.ID,
            sender_id: msg.from_user_id || msg.FromUserID,
            receiver_id: msg.to_user_id || msg.ToUserID,
            content: msg.content || msg.Content,
            created_at: msg.created_at || msg.CreatedAt,
          }));

          setMessages(history.reverse());
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
      }
    };

    if (conversation) {
      fetchHistory();
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [conversation?.user?.id, token, BASE_URL]);

  // 2. NHẬN TIN NHẮN TỪ WEBSOCKET (Đã nâng cấp Bao lô ID & Khử tin nhắn ảo)
  useEffect(() => {
    if (!incomingMessage || !conversation?.user?.id) return;

    const isWrapped = incomingMessage.type === 'NEW_MESSAGE';
    const isRawMessage = incomingMessage.content !== undefined || incomingMessage.Content !== undefined;

    if (!isWrapped && !isRawMessage) return;

    const incoming = isWrapped ? incomingMessage.data : incomingMessage;

    // Bao lô mọi thể loại ID từ Backend Go
    const incomingSenderId = String(incoming.from_user_id || incoming.FromUserID || incoming.sender_id || incoming.SenderID);
    const incomingReceiverId = String(incoming.to_user_id || incoming.ToUserID || incoming.receiver_id || incoming.ReceiverID);
    const partnerId = String(conversation.user.id);
    const myId = String(currentUser?.id);

    const isMessageForThisChat =
      (incomingSenderId === partnerId && incomingReceiverId === myId) ||
      (incomingSenderId === myId && incomingReceiverId === partnerId);

    if (isMessageForThisChat) {
      const newMsg = {
        id: incoming.id || incoming.ID || `temp-${Date.now()}`,
        sender_id: incomingSenderId,
        receiver_id: incomingReceiverId,
        content: incoming.content || incoming.Content || incoming.message,
        created_at: incoming.created_at || incoming.CreatedAt || new Date().toISOString(),
      };

      setMessages((prev) => {
        // Ghi đè tin nhắn ảo (temp) bằng tin nhắn thật từ server
        const existingFakeIndex = prev.findIndex(m => m.id.toString().startsWith('temp-') && m.content === newMsg.content);
        if (existingFakeIndex !== -1) {
          const newList = [...prev];
          newList[existingFakeIndex] = newMsg;
          return newList;
        }
        if (prev.some(m => String(m.id) === String(newMsg.id))) return prev;
        return [...prev, newMsg];
      });
    }
  }, [incomingMessage, conversation?.user?.id, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. GỬI TIN NHẮN
  const handleSend = async () => {
    if (!input.trim() || !conversation?.user?.id || !currentUser) return;

    const contentText = input.trim();
    setInput('');

    // Hiển thị ngay lập tức với ID ảo để UX mượt
    const localMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: conversation.user.id,
      content: contentText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    try {
      await fetch(`${BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_user_id: Number(conversation.user.id),
          content: contentText
        })
      });
    } catch (err) {
      console.error("Lỗi mạng khi gửi tin:", err);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Send size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const partnerName = conversation.user?.username || 'Người dùng';
  const partnerAvatar = conversation.user?.avatar_url || `https://ui-avatars.com/api/?name=${partnerName}&background=random`;
  
  // 🚀 DÒ TÌM TRONG BẢN ĐỒ ĐỂ HIỂN THỊ CHỮ "ĐANG HOẠT ĐỘNG"
  const isActuallyOnline = onlineMap[String(conversation.user.id)] === true;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        {onBack && (
          <button onClick={onBack} className="mr-1 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition lg:hidden">
            <ArrowLeft size={18} />
          </button>
        )}
        <img src={partnerAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{partnerName}</p>
          {/* 🚀 ĐỔI THÀNH isActuallyOnline CHUẨN XÁC 100% */}
          {isActuallyOnline && <p className="text-xs text-green-500 font-medium">Đang hoạt động</p>}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f0f2f5]">
        {messages.map((msg) => {
          const isMyMessage = Boolean(currentUser && String(msg.sender_id) === String(currentUser.id));
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSent={isMyMessage}
              senderAvatar={partnerAvatar}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-end">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none resize-none max-h-24"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full disabled:opacity-50 transition active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}