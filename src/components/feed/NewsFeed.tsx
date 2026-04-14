import { useState, useEffect, useCallback } from 'react';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import MainLayout from '../layout/MainLayout';
import { useApp } from '../../context/AppContext';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function NewsFeed() {
  const { token } = useApp();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // Sử dụng useCallback để hàm không bị tạo lại mỗi lần render
  const fetchNewsfeed = useCallback(async () => {
    if (!token) {
      setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // --- CẬP NHẬT URL: /posts/feed ---
      const response = await fetch(`${BASE_URL}/posts/feed`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Không tìm thấy đường dẫn bài viết (404).");
        if (response.status === 401) throw new Error("Token không hợp lệ (401).");
        throw new Error(`Lỗi máy chủ (${response.status})`);
      }

      const result = await response.json();

      // Backend trả về: { "data": [...] }
      const finalPosts = result.data || [];
      setPosts(finalPosts);

    } catch (err: any) {
      console.error("❌ NewsFeed Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, BASE_URL]);

  useEffect(() => {
    fetchNewsfeed();
  }, [fetchNewsfeed]);

  // Xử lý khi bài viết bị xóa (từ PostCard gọi lên)
  const handleDeleteFromList = (postId: number) => {
    setPosts((prev) => prev.filter(p => p.id !== postId));
  };

  const handleNewPost = (newPost: any) => {
    // Nếu có dữ liệu post mới, đẩy lên đầu. Nếu không, tải lại cả feed.
    if (newPost && newPost.id) {
      setPosts((prev) => [newPost, ...prev]);
    } else {
      fetchNewsfeed();
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[600px] mx-auto space-y-4 pb-20 lg:pb-10">

        {/* Phần Stories (Giữ nguyên giao diện của cậu) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-500 text-xl font-bold group-hover:bg-blue-100 transition-colors">
                +
              </div>
              <span className="text-[10px] font-medium text-gray-500">Tin của bạn</span>
            </div>
          </div>
        </div>

        {/* Form Đăng bài */}
        <CreatePost onPostSuccess={handleNewPost} />

        {/* Nút Làm mới thủ công */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-[1px] bg-gray-100" />
          <button
            onClick={fetchNewsfeed}
            className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            Làm mới feed
          </button>
          <div className="flex-1 h-[1px] bg-gray-100" />
        </div>

        {/* Trạng thái Lỗi */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchNewsfeed}
              className="mt-2 px-4 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {/* Trạng thái Loading */}
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
            <p className="text-gray-400 text-sm font-medium">Đang chuẩn bị bảng tin...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeleteFromList}
                />
              ))
            ) : !loading && (
              <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium">Bảng tin đang trống.</p>
                <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-tight">Hãy theo dõi mọi người hoặc đăng bài đầu tiên!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}