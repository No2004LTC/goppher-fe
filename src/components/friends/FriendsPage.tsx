import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, MessageCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { useApp } from '../../context/AppContext';

// 1. Định nghĩa Interface cho User
interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_following?: boolean; // Nếu backend có trả về trạng thái follow
}

interface FriendCardProps {
  user: User;
  type?: 'friend' | 'request' | 'suggestion';
  onAction: (action: string, userId: number) => Promise<void>;
}

// 2. Component Thẻ Người Dùng
function FriendCard({ user, type = 'friend', onAction }: FriendCardProps) {
  const [loading, setLoading] = useState(false);

  const handleBtnClick = async (action: string) => {
    setLoading(true);
    await onAction(action, user.id);
    setLoading(false);
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=0D8ABC&color=fff`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <img
          src={user.avatar_url || defaultAvatar}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.full_name || user.username}
          </h3>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
        </div>
        <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        {/* SỬA Ở ĐÂY: Dùng !user.is_following thay vì type === 'suggestion' */}
        {!user.is_following ? (
          <>
            <button
              onClick={() => handleBtnClick('follow')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Theo dõi
            </button>
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition">
              <MessageCircle size={14} />
            </button>
          </>
        ) : (
          /* NẾU ĐÃ FOLLOW (is_following === true) -> HIỆN NÚT HỦY THEO DÕI */
          <>
            <button
              onClick={() => handleBtnClick('unfollow')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium rounded-xl transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              Đang theo dõi
            </button>
            <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">
              <MessageCircle size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// 3. Trang chính
export default function FriendsPage() {
  const { token } = useApp();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');

  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // --- HÀM TẢI DỮ LIỆU ---
  const fetchUsers = async (query = '') => {
    setIsLoading(true);
    try {
      const endpoint = query ? `/users/search?q=${query}` : `/users/search`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (response.ok) {
        // --- ĐOẠN FIX QUAN TRỌNG NHẤT Ở ĐÂY ---
        // Nếu Backend trả về trực tiếp mảng [...]
        if (Array.isArray(result)) {
          setUsersList(result);
        }
        // Nếu Backend bọc trong cục { data: [...] }
        else if (result.data && Array.isArray(result.data)) {
          setUsersList(result.data);
        }
        else {
          setUsersList([]);
        }
      } else {
        console.error("Backend trả về lỗi:", result);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce (Chờ người dùng gõ xong mới gọi API)
  useEffect(() => {
    if (activeTab === 'suggestions') {
      const delayTimer = setTimeout(() => {
        fetchUsers(searchQuery);
      }, 500); // Đợi 0.5s sau khi gõ xong
      return () => clearTimeout(delayTimer);
    } else {
      // Các tab khác chưa có API nên tạm thời clear list
      setUsersList([]);
    }
  }, [searchQuery, activeTab, token]);

  // --- HÀM XỬ LÝ FOLLOW / UNFOLLOW ---
  const handleAction = async (action: string, userId: number) => {
    // 1. Lưu lại danh sách cũ (để phòng hờ gọi API bị lỗi thì khôi phục lại)
    const previousUsersList = [...usersList];

    // 2. CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC (Optimistic UI)
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        return { ...u, is_following: action === 'follow' };
      }
      return u;
    }));

    try {
      // 3. Bắt đầu gọi API ngầm phía sau
      const endpoint = action === 'follow' ? `/users/${userId}/follow` : `/users/${userId}/unfollow`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 4. Nếu API lỗi, khôi phục lại giao diện cũ
      if (!response.ok) {
        throw new Error("Lỗi thao tác từ Server");
      }

      // Nếu thành công thì... không cần làm gì cả vì UI đã cập nhật từ bước 2 rồi! 😎

    } catch (error) {
      console.error("Lỗi action:", error);
      setUsersList(previousUsersList); // Rollback UI
      alert("Không thể thực hiện thao tác này, vui lòng thử lại!");
    }
  };

  const tabs = [
    { id: 'suggestions', label: 'Gợi ý / Tìm kiếm' },
    { id: 'friends', label: 'Đang theo dõi' }, // Sau này nối API GetFollowing
    { id: 'requests', label: 'Người theo dõi' }, // Sau này nối API GetFollowers
  ];

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Kết nối</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ô Tìm Kiếm (Chỉ hiện ở tab Gợi ý) */}
        {activeTab === 'suggestions' && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên tài khoản để tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        )}

        {/* Danh Sách User */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersList.map((u) => (
              <FriendCard
                key={u.id}
                user={u}
                type={activeTab === 'suggestions' ? 'suggestion' : 'friend'}
                onAction={handleAction}
              />
            ))}
          </div>
        )}

        {/* Trạng thái rỗng */}
        {!isLoading && usersList.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'suggestions' ? 'Không tìm thấy người dùng nào' : 'Tính năng đang được cập nhật'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'suggestions'
                ? 'Thử tìm kiếm với một từ khóa khác xem sao.'
                : 'API Backend cho tính năng này sẽ sớm được hoàn thiện.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}