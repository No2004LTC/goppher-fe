import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import MainLayout from '../layout/MainLayout';
import { useApp } from '../../context/AppContext';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function NewsFeed() {
  const { token, user } = useApp();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  const fetchNewsfeed = async () => {
    if (!token) {
      console.error("❌ NewsFeed: Không tìm thấy Token trong Context!");
      setError("Bạn chưa đăng nhập hoặc Token bị mất.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`📡 NewsFeed: Đang gọi API ${BASE_URL}/posts...`);

      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📊 NewsFeed: HTTP Status:", response.status);

      if (response.status === 401) {
        throw new Error("Token không hợp lệ hoặc hết hạn (401 Unauthorized).");
      }

      const result = await response.json();
      console.log("📦 Dữ liệu thô từ Backend:", result);

      // --- KIỂM TRA CẤU TRÚC DỮ LIỆU ---
      // Backend của cậu có thể trả về: { data: [...] } hoặc { posts: [...] } hoặc trực tiếp [...]
      let finalPosts = [];
      if (Array.isArray(result)) {
        finalPosts = result;
      } else if (result.data && Array.isArray(result.data)) {
        finalPosts = result.data;
      } else if (result.posts && Array.isArray(result.posts)) {
        finalPosts = result.posts;
      }

      console.log("✅ NewsFeed: Số lượng bài viết sau khi xử lý:", finalPosts.length);
      setPosts(finalPosts);

    } catch (err: any) {
      console.error("❌ NewsFeed Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsfeed();
  }, [token]);

  const handleNewPost = (newPost: any) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    } else {
      fetchNewsfeed();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 pb-20 lg:pb-6">
        {/* Phần Stories */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-500 text-xl font-bold">
                +
              </div>
              <span className="text-[10px] font-medium text-gray-500">Tin của bạn</span>
            </div>
          </div>
        </div>

        <CreatePost onPostSuccess={handleNewPost} />

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
            <AlertTriangle size={20} />
            <p className="text-sm">{error}</p>
            <button onClick={fetchNewsfeed} className="ml-auto underline font-bold">Thử lại</button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium px-2 italic">Bài viết mới nhất</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-gray-400 text-sm">Đang tải bài viết...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts
                .filter(p => p && (p.id || p.ID)) // Lọc bỏ bài viết rác
                .map((post, index) => (
                  <PostCard key={post.id || post.ID || index} post={post} />
                ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400">Không tìm thấy bài viết nào.</p>
                <p className="text-xs text-gray-300 mt-1">Gợi ý: Hãy thử đăng một bài mới!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}