import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { useApp } from '../../../context/AppContext';

export default function ChatBox({ conversation, onBack, incomingMessage }: any) {
  const { token, user: currentUser } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 1. NHẬN TIN NHẮN TỪ PROPS (THAY VÌ TẠO WEBSOCKET MỚI LÀM LỖI SERVER)
  useEffect(() => {
    if (!incomingMessage || !conversation?.user?.id) return;

    if (incomingMessage.type === 'NEW_MESSAGE') {
      const incoming = incomingMessage.data || incomingMessage;

      const newMsg = {
        id: incoming.id,
        sender_id: incoming.from_user_id || incoming.FromUserID,
        receiver_id: incoming.to_user_id || incoming.ToUserID,
        content: incoming.content || incoming.Content,
        created_at: incoming.created_at || incoming.CreatedAt,
      };

      // Chỉ hiển thị tin nhắn nếu nó đúng là của người đang mở chat
      if (String(newMsg.sender_id) === String(conversation.user.id)) {
        setMessages((prev) => {
          if (prev.some(m => String(m.id) === String(newMsg.id))) return prev;
          return [...prev, newMsg];
        });
      }
    }
  }, [incomingMessage, conversation?.user?.id]);

  // 2. LẤY LỊCH SỬ CHAT
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
          history = history.reverse();
          setMessages(history);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
      }
    };

    if (conversation) {
      fetchHistory();
      setInput('');
      inputRef.current?.focus();
    }
  }, [conversation?.user?.id, token, BASE_URL]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. GỬI TIN NHẮN
  const handleSend = async () => {
    if (!input.trim() || !conversation?.user?.id || !currentUser) return;

    const contentText = input.trim();
    setInput('');

    const localMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: conversation.user.id,
      content: contentText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    try {
      const res = await fetch(`${BASE_URL}/chats`, {
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
        <p className="text-sm font-medium">Chọn một cuộc trò chuyện</p>
      </div>
    );
  }

  const partnerName = conversation.user?.username || 'Người dùng';
  const partnerAvatar = conversation.user?.avatar_url || `https://ui-avatars.com/api/?name=${partnerName}&background=random`;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        {onBack && (
          <button onClick={onBack} className="mr-1 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition lg:hidden">
            <ArrowLeft size={18} />
          </button>
        )}
        <img src={partnerAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{partnerName}</p>
          {conversation.is_online && <p className="text-xs text-green-500 font-medium">Đang hoạt động</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
          <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 bg-blue-600 text-white rounded-full disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}