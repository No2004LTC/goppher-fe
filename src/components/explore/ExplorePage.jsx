import { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash, MapPin, Calendar, Filter, Loader2 } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import PostCard from '../feed/PostCard';
import { useApp } from '../../context/AppContext';

export default function ExplorePage() {
  const { user, token } = useApp(); // Lấy user (có userID) và token từ context
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // State lưu dữ liệu thật từ BE
  const [realPosts, setRealPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // Hàm lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      try {
        // Gọi song song cả bài viết và user gợi ý
        const [postsRes, usersRes] = await Promise.all([
          fetch(`${BASE_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${BASE_URL}/users/suggested`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!postsRes.ok || !usersRes.ok) throw new Error('Không thể tải dữ liệu');

        const postsData = await postsRes.json();
        const usersData = await usersRes.json();

        setRealPosts(postsData.data || []); // Giả sử BE trả về { data: [...] }
        setSuggestedUsers(usersData.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchExploreData();
    }
  }, [token, BASE_URL]);

  // Logic filter bài viết dựa trên searchQuery
  const filteredPosts = realPosts.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        {/* Header & Search Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Khám phá</h1>
            {user && (
              <p className="text-xs text-blue-600">Xin chào, {user.username} (ID: {user.id})</p>
            )}
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
            <Filter size={18} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, người dùng, hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {['trending', 'hashtags', 'places', 'events'].map((id) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${activeCategory === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {id.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <p className="text-gray-500 text-sm">Đang tải dữ liệu cho {user?.username}...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Người dùng đề xuất (Dữ liệu thật) */}
            {activeCategory === 'trending' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Người dùng đề xuất</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {suggestedUsers.map((u) => (
                    <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <img src={u.avatar_url || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-full mb-2" alt="" />
                      <p className="font-semibold text-sm truncate">{u.username}</p>
                      <button className="w-full mt-2 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition">
                        Theo dõi
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bài viết nổi bật (Dữ liệu thật) */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Bài viết nổi bật</h2>
              <div className="space-y-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-10">Không tìm thấy bài viết nào.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}