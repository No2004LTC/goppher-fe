import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { useApp } from '../../../context/AppContext';

export default function ChatBox({ conversation, onBack }: any) {
  const { token, user: currentUser } = useApp(); // Lấy token và current user
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // ==========================================
  // 1. HỨNG WEBSOCKET (CHỈ ĐỂ NHẬN)
  // ==========================================
  // Hook useWebSocket của bạn chỉ nên dùng để LẮNG NGHE
  useEffect(() => {
    if (!token || !conversation?.user?.id) return;

    // Khởi tạo kết nối
    const ws = new WebSocket(`ws://localhost:8080/api/v1/ws?token=${token}`);

    ws.onopen = () => {
      console.log('🟢 [WS] Đã mở ống kết nối thành công!');
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        console.log("📩 [WS] Có tin nhắn từ Server bay về:", parsed);

        if (parsed.type === 'NEW_MESSAGE') {
          const incoming = parsed.data;

          // Chuyển đổi key cho khớp với frontend
          const newMsg = {
            id: incoming.id,
            sender_id: incoming.from_user_id,
            receiver_id: incoming.to_user_id,
            content: incoming.content,
            created_at: incoming.created_at,
          };

          // Bộ lọc chống lặp: Nếu tin nhắn do chính mình gửi, bỏ qua (vì hàm handleSend đã vẽ ra rồi)
          if (currentUser && String(newMsg.sender_id) === String(currentUser.id)) return;

          // Lọc nhầm phòng: Nếu tin nhắn đến KHÔNG phải của người mình đang mở chat, bỏ qua.
          if (String(newMsg.sender_id) !== String(conversation.user.id)) return;

          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev; // Chống dội âm (Echo)
            return [...prev, newMsg];
          });
        }
      } catch (e) {
        console.error("🔴 [WS] Lỗi đọc dữ liệu:", e);
      }
    };

    ws.onerror = (e) => {
      console.error("🔴 [WS] Lỗi đường truyền:", e);
    };

    ws.onclose = () => {
      console.log("⚪ [WS] Ống kết nối đã đóng");
    };

    // Khi người dùng thoát phòng chat hoặc component unmount -> Dọn rác
    return () => {
      ws.close();
    };
  }, [token, conversation?.user?.id, currentUser]);

  // ==========================================
  // 2. LẤY LỊCH SỬ CHAT (API GET)
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

          history = history.map((msg: any) => ({
            id: msg.id || msg.ID,
            sender_id: msg.from_user_id || msg.FromUserID,
            receiver_id: msg.to_user_id || msg.ToUserID,
            content: msg.content || msg.Content,
            created_at: msg.created_at || msg.CreatedAt,
          }));

          // Đảo mảng để tin mới nhất nằm ở dưới
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

  // Cuộn xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================================
  // 3. GỬI TIN NHẮN (API POST)
  // ==========================================
  const handleSend = async () => {
    if (!input.trim() || !conversation?.user?.id || !currentUser) return;

    const contentText = input.trim();
    setInput(''); // Clear input ngay lập tức

    // Vẽ lên UI ngay lập tức để tạo cảm giác mượt (Optimistic UI)
    const localMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: conversation.user.id,
      content: contentText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    // Gửi lên server bằng HTTP POST
    try {
      const res = await fetch(`${BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_user_id: conversation.user.id,
          content: contentText
        })
      });

      if (!res.ok) {
        console.error("Lỗi gửi tin nhắn");
        // Xử lý báo lỗi tin nhắn ở đây nếu cần (vd: đổi màu bong bóng)
      }
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

  // Nếu chưa chọn ai để chat
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
          // SỬA Ở ĐÂY: Thêm hàm Boolean() bọc bên ngoài
          const isMyMessage = Boolean(currentUser && String(msg.sender_id) === String(currentUser.id));

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSent={isMyMessage} // Bây giờ nó chắc chắn 100% là boolean
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
          <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 bg-blue-600 text-white rounded-full disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}