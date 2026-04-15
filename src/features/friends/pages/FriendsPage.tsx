import { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, MessageCircle, MoreHorizontal, Loader2, Users } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import { useApp } from '../../../context/AppContext';

// 1. Interface
interface User {
  id: number;
  username: string;
  avatar_url?: string;
  is_following?: boolean;
  is_followed_by?: boolean;
}

interface FriendCardProps {
  user: User;
  onAction: (action: string, userId: number) => Promise<void>;
}

// 2. Component Thẻ Người Dùng (GIỮ NGUYÊN 100% LOGIC BẠN BÈ ĐÃ LÀM ĐÚNG)
function FriendCard({ user, onAction }: FriendCardProps) {
  const [loading, setLoading] = useState(false);

  const handleBtnClick = async (action: string) => {
    setLoading(true);
    await onAction(action, user.id);
    setLoading(false);
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <img
          src={user.avatar_url || defaultAvatar}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
        </div>
        <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
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
        ) : user.is_following && user.is_followed_by ? (
          <>
            <button
              onClick={() => handleBtnClick('unfollow')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-blue-700 text-sm font-medium rounded-xl transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
              Bạn bè
            </button>
            <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm shadow-blue-200">
              <MessageCircle size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleBtnClick('unfollow')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium rounded-xl transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              Đang theo dõi
            </button>
            <button className="px-3 py-2 bg-gray-100 hover:bg-blue-50 text-blue-600 rounded-xl transition">
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
  // Đổi các Tab theo đúng ý: Bạn bè | Đang theo dõi | Người theo dõi | Tìm kiếm
  const [activeTab, setActiveTab] = useState<'friends' | 'following' | 'followers' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // Lấy data và BỘ LỌC ĐỘC QUYỀN
  const fetchUsers = async (query = '', currentTab = activeTab) => {
    setIsLoading(true);
    try {
      let endpoint = `/users/search?q=${query}`;

      // Nếu là Bạn bè HOẶC Đang theo dõi -> Đều gọi API Following
      if (currentTab === 'friends' || currentTab === 'following') endpoint = `/users/following`;
      // Nếu là Người theo dõi -> Gọi API Followers
      if (currentTab === 'followers') endpoint = `/users/followers`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (response.ok) {
        let data: User[] = Array.isArray(result) ? result : (result.data || []);

        // --- BỘ LỌC ĐỘC QUYỀN (RẠCH RÒI TỪNG NHÓM) ---
        if (currentTab === 'friends') {
          // BẠN BÈ: Chỉ lấy những người có follow chéo
          data = data.filter(u => u.is_followed_by === true && u.is_following === true);
        } else if (currentTab === 'following') {
          // ĐANG THEO DÕI: Mình follow họ, nhưng loại bỏ những người đã là Bạn Bè
          data = data.filter(u => u.is_following === true && u.is_followed_by === false);
        } else if (currentTab === 'followers') {
          // NGƯỜI THEO DÕI: Họ follow mình, nhưng loại bỏ những người đã là Bạn Bè
          data = data.filter(u => u.is_followed_by === true && u.is_following === false);
        }

        setUsersList(data);
      } else {
        setUsersList([]);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setUsersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      const delay = setTimeout(() => fetchUsers(searchQuery, activeTab), 500);
      return () => clearTimeout(delay);
    } else {
      fetchUsers('', activeTab);
    }
  }, [searchQuery, activeTab, token]);

  const handleAction = async (action: string, userId: number) => {
    // HIỆU ỨNG UX TUYỆT ĐỐI: 
    // Vì các tab đã bị lọc rạch ròi, nếu cậu bấm một nút làm thay đổi trạng thái
    // (VD: Đang ở tab "Người theo dõi", cậu bấm "Theo dõi" -> Thành Bạn Bè -> Nó phải biến mất khỏi tab này ngay lập tức)
    setUsersList(prevList => {
      if (activeTab === 'search') {
        // Riêng tab search thì giữ nguyên thẻ, chỉ đổi màu nút
        return prevList.map(u => u.id === userId ? { ...u, is_following: action === 'follow' } : u);
      }
      // Các tab khác: Xóa thẻ đó đi (vì nó đã bay sang tab khác rồi)
      return prevList.filter(u => u.id !== userId);
    });

    try {
      const endpoint = action === 'follow' ? `/users/${userId}/follow` : `/users/${userId}/unfollow`;
      await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    } catch (error) {
      console.error("Lỗi action:", error);
    }
  };

  const filteredUsers = activeTab === 'search'
    ? usersList
    : usersList.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs = [
    { id: 'friends', label: 'Bạn bè' },
    { id: 'following', label: 'Đang theo dõi' },
    { id: 'followers', label: 'Người theo dõi' },
    { id: 'search', label: 'Tìm kiếm' },
  ] as const;

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Kết nối</h1>

        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && !isLoading && activeTab !== 'search' && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                  {usersList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'search' ? "Nhập username để tìm kiếm toàn hệ thống..." : "Lọc danh sách bên dưới..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <FriendCard
                  key={user.id}
                  user={user}
                  onAction={handleAction}
                />
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mt-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'friends' && 'Bạn chưa có người bạn nào'}
                  {activeTab === 'following' && 'Bạn chưa theo dõi ai khác'}
                  {activeTab === 'followers' && 'Chưa có ai theo dõi bạn'}
                  {activeTab === 'search' && 'Không tìm thấy người dùng'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'friends' && 'Khi bạn và ai đó cùng theo dõi nhau, họ sẽ xuất hiện ở đây.'}
                  {activeTab === 'following' && 'Sang tab Tìm kiếm để kết nối với những Gopher khác nhé.'}
                  {activeTab === 'followers' && 'Hãy chăm chỉ tương tác để có thêm người theo dõi.'}
                  {activeTab === 'search' && 'Thử nhập một username khác xem sao.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}