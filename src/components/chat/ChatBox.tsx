import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreHorizontal, Smile, Image, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../common/LoadingSpinner';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useApp } from '../../context/AppContext';

export default function ChatBox({ conversation, onBack }: any) {
  const { token } = useApp(); // Không cần dùng biến user ở đây nữa để tránh lỗi undefined
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const WS_URL = token ? `ws://localhost:8080/api/v1/ws?token=${token}` : null;

  // ==========================================
  // 1. HỨNG WEBSOCKET & BỘ LỌC CHỐNG DỘI ÂM
  // ==========================================
  const { sendMessage: wsSend } = useWebSocket(WS_URL, (data: any) => {
    if (data.type === 'NOTIFICATION') return;

    const incoming = {
      id: data.id || data.ID || Date.now(),
      sender_id: data.from_user_id || data.FromUserID,
      receiver_id: data.to_user_id || data.ToUserID,
      content: data.content || data.Content,
      created_at: data.created_at || data.CreatedAt || new Date().toISOString(),
    };

    // TƯ DUY ĐẢO NGƯỢC (Chống Echo):
    // Nếu tin nhắn từ Server đẩy về có ID người gửi KHÁC với ID của người mình đang chat
    // => Chắc chắn 100% đây là tin nhắn do CHÍNH MÌNH gửi bị Server dội ngược lại!
    // => Bỏ qua luôn, vì mình đã tự in ra màn hình lúc bấm nút Send rồi.
    if (String(incoming.sender_id) !== String(conversation?.user?.id)) {
      return;
    }

    // Nếu lọt qua cửa trên, tức là tin nhắn CỦA NGƯỜI KIA gửi cho mình.
    setMessages((prev) => {
      // Chống lặp data lỡ mạng lag
      const isDuplicate = prev.some(m => m.id === incoming.id || (m.content === incoming.content && String(m.sender_id) === String(incoming.sender_id)));
      if (isDuplicate) return prev;
      return [...prev, incoming];
    });
  });

  // ==========================================
  // 2. LẤY LỊCH SỬ CHAT TỪ DATABASE
  // ==========================================
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

          // Map lại biến cho đúng chuẩn FE
          history = history.map((msg: any) => ({
            id: msg.id || msg.ID,
            sender_id: msg.from_user_id || msg.FromUserID,
            receiver_id: msg.to_user_id || msg.ToUserID,
            content: msg.content || msg.Content,
            created_at: msg.created_at || msg.CreatedAt,
          }));

          // Đảo ngược để tin nhắn cũ nổi lên trên, mới chìm xuống đáy
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
  }, [conversation?.user?.id, token]);

  // Cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ==========================================
  // 3. XỬ LÝ GỬI TIN NHẮN (OPTIMISTIC UI)
  // ==========================================
  const handleSend = () => {
    if (!input.trim() || !conversation?.user?.id) return;
    const contentText = input.trim();

    // 3.1 Tự vẽ lên màn hình của mình ngay lập tức cho mượt
    const localMsg = {
      id: `local-${Date.now()}`,
      sender_id: 'me', // Đánh dấu là 'me' để nó luôn khác với Partner ID -> Nằm bên Phải
      receiver_id: conversation.user.id,
      content: contentText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);
    setInput(''); // Xóa input

    // 3.2 Bắn JSON xuống Golang qua WebSocket
    const payload = {
      to_user_id: conversation.user.id,
      content: contentText,
    };

    wsSend(payload);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Nếu chưa chọn ai để chat thì hiện giao diện trống
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
      {/* Header phòng chat */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        {onBack && (
          <button onClick={onBack} className="mr-1 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition lg:hidden">
            <ArrowLeft size={18} />
          </button>
        )}
        <img src={partnerAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{partnerName}</p>
          <p className="text-xs text-green-500 font-medium">Đang hoạt động</p>
        </div>
      </div>

      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          // PHÉP THUẬT PHÂN BỜ TRÁI/PHẢI Ở ĐÂY:
          // Nếu sender_id khác với ID của người kia -> Suy ra là mình gửi!
          const isMyMessage = String(msg.sender_id) !== String(conversation?.user?.id);

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

      {/* Khu vực nhập tin nhắn */}
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
          <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 bg-blue-600 text-white rounded-full">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}