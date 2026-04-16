import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MoreHorizontal, UserPlus, MessageCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWebSocket } from '../../hooks/useWebSocket';

// --- Interfaces ---
interface SuggestedUser {
  id: number;
  username: string;
  avatar_url: string;
  mutual_friends_count: number;
}

interface OnlineFriend {
  id: number;
  username: string;
  avatar_url: string;
  is_online: boolean;
}

export default function RightWidgets() {
  const { token } = useApp();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 🔌 Kết nối WebSocket
  const { latestData } = useWebSocket(token ? `ws://localhost:8080/api/v1/ws?token=${token}` : null);

  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lấy danh sách Gợi ý
  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.data) setSuggestedUsers(data.data);
    } catch (err) {
      console.error("Lỗi fetch suggestions:", err);
    }
  }, [token, BASE_URL]);

  // 2. Lấy danh sách Online (ĐÃ THÊM BỘ LỌC)
  const fetchOnlineContacts = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/online-contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();

      if (result?.data) {
        // 🚀 CHỈ LẤY những người thực sự online (is_online === true)
        const realOnline = result.data.filter((f: OnlineFriend) => f.is_online === true);
        setOnlineFriends(realOnline);
      }
    } catch (err) {
      console.error("Lỗi fetch online contacts:", err);
    }
  }, [token, BASE_URL]);

  // 3. Khởi tạo dữ liệu
  useEffect(() => {
    if (!token) return;
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchSuggestions(), fetchOnlineContacts()]);
      setLoading(false);
    };
    initData();
  }, [token, fetchSuggestions, fetchOnlineContacts]);

  // 4. Cập nhật Real-time từ WebSocket
  useEffect(() => {
    if (latestData?.type === 'USER_STATUS_CHANGE') {
      fetchOnlineContacts();
    }
  }, [latestData, fetchOnlineContacts]);

  const handleMessageClick = (userId: number) => {
    navigate(`/chat?to_user=${userId}`);
  };

  if (loading) {
    return (
      <aside className="hidden xl:flex flex-col items-center justify-center w-[320px] sticky top-4 h-[calc(100vh-2rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </aside>
    );
  }

  return (
    <aside className="hidden xl:block w-[320px] flex-shrink-0 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar pb-20 pl-6">

      {/* GỢI Ý KẾT BẠN */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Gợi ý cho bạn</h3>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Xem tất cả</button>
        </div>
        <div className="space-y-4">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 group">
                <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                  <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} className="w-10 h-10 rounded-full object-cover border border-gray-100 group-hover:opacity-80 transition" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${user.username}`} className="text-sm font-bold text-gray-900 truncate hover:underline block">
                    {user.username}
                  </Link>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {user.mutual_friends_count > 0 ? `Có ${user.mutual_friends_count} bạn chung` : 'Người dùng mới'}
                  </p>
                </div>
                <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-all">
                  <UserPlus size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-2 italic">Không có gợi ý mới</p>
          )}
        </div>
      </div>

      {/* ĐANG HOẠT ĐỘNG (REAL-TIME) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Đang hoạt động</h3>
            {/* 🟢 Pulse chỉ hiện khi thực sự có người online */}
            {onlineFriends.length > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            )}
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"><Search size={16} /></button>
            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        <div className="space-y-1 -mx-2">
          {onlineFriends.length > 0 ? (
            onlineFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition group"
                onClick={() => handleMessageClick(friend.id)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.username}&background=0D8ABC&color=fff`}
                    alt={friend.username}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm"
                  />
                  {/* 🟢 Chấm xanh hiển thị động theo status */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{friend.username}</p>
                  <p className="text-[10px] text-green-600 font-medium">Đang trực tuyến</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-600 bg-blue-50 rounded-full transition-all">
                  <MessageCircle size={14} />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center px-4">
              <p className="text-sm text-gray-400 italic">Mọi người đều đang offline</p>
              <p className="text-[11px] text-gray-300 mt-1">Hãy quay lại sau nhé!</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-[11px] text-gray-400 flex flex-wrap gap-x-4 gap-y-2 px-2 border-t border-gray-50 pt-6">
        <span>ConnectVN © 2026</span>
        <span className="hover:underline cursor-pointer">Quyền riêng tư</span>
        <span className="hover:underline cursor-pointer">Điều khoản</span>
      </div>
    </aside>
  );
}