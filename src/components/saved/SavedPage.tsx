import { useState, useEffect } from 'react';
import { Bookmark, Grid2x2 as Grid, List, Search, Loader2 } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import PostCard from '../feed/PostCard';
import { useApp } from '../../context/AppContext';

export default function SavedPage() {
  const { token } = useApp();
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${BASE_URL}/bookmarks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
          const posts = Array.isArray(result) ? result : (result.data || []);
          // Bật sẵn cờ is_saved = true để UI PostCard tự động tô màu vàng cho nút Bookmark
          setSavedPosts(posts.map((p: any) => ({ ...p, is_saved: true })));
        }
      } catch (error) {
        console.error("Lỗi tải bài viết đã lưu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [token]);

  // Nếu người dùng xóa bài viết hoặc bỏ lưu, xóa nó khỏi danh sách hiển thị
  const handleRemoveSaved = (postId: number) => {
    setSavedPosts(prev => prev.filter(p => p.id !== postId));
  };

  const filteredPosts = savedPosts.filter(post =>
    (post.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.author?.username || post.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Đã lưu</h1>
            <p className="text-sm text-gray-500 mt-1">{savedPosts.length} bài viết</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                <List size={16} />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết đã lưu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* DANH SÁCH BÀI VIẾT */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleRemoveSaved}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mt-4 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài viết đã lưu</h3>
            <p className="text-gray-500 text-sm">
              Lưu những bài viết yêu thích trên Newsfeed để xem lại sau nhé.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}