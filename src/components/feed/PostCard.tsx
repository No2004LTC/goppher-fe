import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'vừa xong';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}p`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function PostCard({ post = {} }) {
  // normalize fallback values
  const authorAvatar = post.author_avatar ?? post.author?.avatar_url ?? post.user?.avatar_url ?? 'https://via.placeholder.com/40';
  const authorName = post.author_name ?? post.author?.name ?? post.user?.username ?? 'Người dùng';
  const createdAt = post.created_at ?? post.createdAt ?? post.created_at_iso ?? Date.now();
  const content = post.content ?? post.text ?? '';
  const imageUrl = post.image_url ?? post.image ?? post.media?.url ?? null;
  const initialLikes = Number(post.likes_count ?? post.likes ?? 0);
  const commentsCount = Number(post.comments_count ?? post.comments ?? 0);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [saved, setSaved] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  // sync likes when post prop changes (avoid stale initial state)
  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  const toggleLike = () => {
    setLiked(prev => {
      const next = !prev;
      setLikes(curr => (next ? curr + 1 : Math.max(0, curr - 1)));
      return next;
    });
    // TODO: call API to persist like/unlike
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-400">{timeAgo(createdAt)} trước</p>
            </div>
          </div>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-3">{content}</p>

        {imageUrl && (
          <div className="-mx-4 mb-3">
            <img
              src={imageUrl}
              alt="post"
              className="w-full object-cover max-h-80"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-t border-b border-gray-50">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-150 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span>{likes}</span>
            </button>

            <button
              onClick={() => setShowComment(!showComment)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition"
            >
              <MessageCircle size={18} />
              <span>{commentsCount}</span>
            </button>

            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-green-500 transition">
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
          </div>

          <button
            onClick={() => setSaved(!saved)}
            className={`transition ${saved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {showComment && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Viết bình luận..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-300 transition"
            />
            <button
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
              disabled={!comment.trim()}
              onClick={() => setComment('')}
            >
              Gửi
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
