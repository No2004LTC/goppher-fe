import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash, MapPin, Calendar, Filter, Loader2, Sparkles } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import PostCard from '../feed/PostCard';
import { useApp } from '../../context/AppContext';

export default function ExplorePage() {
  const { user, token } = useApp();
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // Dùng <any[]> để TypeScript không báo lỗi khi xử lý dữ liệu động
  const [discoveryPosts, setDiscoveryPosts] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // Hàm lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Gọi API Lấy bài viết Khám phá (Dùng đúng endpoint của cậu)
        const postsRes = await fetch(`${BASE_URL}/posts/discovery`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!postsRes.ok) {
          throw new Error('Không thể tải bài viết khám phá');
        }

        const postsData = await postsRes.json();

        // Cấu trúc an toàn để bắt đúng mảng dữ liệu
        let finalPosts = [];
        if (Array.isArray(postsData)) finalPosts = postsData;
        else if (postsData.data) finalPosts = postsData.data;
        else if (postsData.posts) finalPosts = postsData.posts;

        setDiscoveryPosts(finalPosts);

        // 2. Chỗ này đáng lẽ gọi API /users/suggested, 
        // nhưng Backend chưa có nên ta tạm thời set mảng rỗng
        setSuggestedUsers([]);

      } catch (err: any) {
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

  // Logic filter bài viết cục bộ (đề phòng BE chưa có API search post)
  const filteredPosts = discoveryPosts.filter(post => {
    const contentMatch = post?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post?.text?.toLowerCase().includes(searchQuery.toLowerCase());

    // Normalize tên tác giả giống bên PostCard
    const authorName = post?.author?.username || post?.user?.username || post?.author_name || '';
    const authorMatch = authorName.toLowerCase().includes(searchQuery.toLowerCase());

    return contentMatch || authorMatch;
  });

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        {/* Header & Search Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Khám phá <Sparkles size={20} className="text-yellow-500" />
            </h1>
            {user && (
              <p className="text-xs text-gray-500">
                Tìm hiểu thế giới Gopher xung quanh {user.username}
              </p>
            )}
          </div>
          <button className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition shadow-sm">
            <Filter size={18} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, người dùng, hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'trending', label: 'Thịnh hành', icon: TrendingUp },
            { id: 'hashtags', label: 'Chủ đề', icon: Hash },
            { id: 'places', label: 'Địa điểm', icon: MapPin },
            { id: 'events', label: 'Sự kiện', icon: Calendar }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${activeCategory === id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-gray-500 font-medium text-sm">Đang tải nội dung khám phá...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100 font-medium">
            {error}
          </div>
        ) : (
          <div className="space-y-6">

            {/* Người dùng đề xuất (Sẽ mở lại khi Backend có API) */}
            {activeCategory === 'trending' && suggestedUsers.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Người dùng đề xuất</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {suggestedUsers.map((u) => (
                    <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition">
                      <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=random`} className="w-16 h-16 rounded-full mb-3 object-cover border border-gray-100" alt={u.username} />
                      <p className="font-bold text-gray-900 text-sm truncate w-full">{u.full_name || u.username}</p>
                      <p className="text-xs text-gray-500 mb-3 truncate w-full">@{u.username}</p>
                      <button className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-600 hover:text-white transition">
                        Theo dõi
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bài viết nổi bật (Gọi API Discovery) */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Bài viết mới nhất</h2>
              <div className="space-y-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <PostCard key={post?.id || `discovery-${index}`} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Hash size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Chưa có bài viết nào để khám phá.</p>
                    <p className="text-xs text-gray-400 mt-1">Hãy quay lại sau nhé!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}