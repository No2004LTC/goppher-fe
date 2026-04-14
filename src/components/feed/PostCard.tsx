import { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'vừa xong';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}p`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function PostCard({ post = {} as any, onDelete }: any) {
  const { token, user: currentUser } = useApp();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // --- 1. ĐỊNH DANH TÁC GIẢ (Khớp với DTO Author mới) ---
  const author = post.author || post.user || {};
  const authorID = author.id || post.user_id;

  // Kiểm tra quyền sở hữu bài viết (Dùng ID thật từ AppContext)
  const isMyPost = currentUser && authorID && String(currentUser.id) === String(authorID);

  const authorAvatar = author.avatar_url || `https://ui-avatars.com/api/?name=${author.username || 'U'}&background=random`;
  const authorName = author.username || 'Người dùng ẩn danh';

  // State Bài viết
  const [content, setContent] = useState(post.content || '');
  const [likes, setLikes] = useState(Number(post.likes_count || 0));
  const [liked, setLiked] = useState(Boolean(post.is_liked));
  const [saved, setSaved] = useState(Boolean(post.is_saved));

  // State Menu & Edit
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const menuRef = useRef<HTMLDivElement>(null);

  // State Comment
  const [commentsCount, setCommentsCount] = useState(Number(post.comments_count || 0));
  const [showComment, setShowComment] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentList, setCommentList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đồng bộ state khi dữ liệu post từ cha truyền xuống thay đổi
  useEffect(() => {
    setContent(post.content || '');
    setLikes(Number(post.likes_count || 0));
    setLiked(Boolean(post.is_liked));
    setSaved(Boolean(post.is_saved));
    setCommentsCount(Number(post.comments_count || 0));
    setEditContent(post.content || '');
  }, [post]);

  // ==========================================
  // API LOGIC: TƯƠNG TÁC BÀI VIẾT
  // ==========================================
  const toggleLike = async () => {
    const prevLiked = liked;
    const prevLikesCount = likes;
    setLiked(!prevLiked);
    setLikes(prevLiked ? prevLikesCount - 1 : prevLikesCount + 1);
    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(prevLiked);
      setLikes(prevLikesCount);
    }
  };

  const toggleSave = async () => {
    const prevSaved = saved;
    setSaved(!prevSaved);
    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.is_saved);
      } else throw new Error();
    } catch {
      setSaved(prevSaved);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok && onDelete) onDelete(post.id);
    } catch (err) { console.error("Lỗi xóa bài:", err); }
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent.trim() })
      });
      if (res.ok) {
        setContent(editContent);
        setIsEditing(false);
      }
    } catch (err) { console.error("Lỗi sửa bài:", err); }
  };

  // ==========================================
  // API LOGIC: BÌNH LUẬN (Khớp Route REST mới)
  // ==========================================
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setCommentList(result.data || result);
    } finally { setLoadingComments(false); }
  };

  const handleToggleComment = () => {
    const willShow = !showComment;
    setShowComment(willShow);
    if (willShow && commentList.length === 0) fetchComments();
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentInput.trim() })
      });
      const result = await res.json();
      if (res.ok) {
        setCommentList(prev => [result.data || result, ...prev]);
        setCommentInput('');
        setCommentsCount(prev => prev + 1);
      }
    } catch (err) { console.error("Lỗi đăng bình luận:", err); }
  };

  const handleDeleteComment = async (cmtId: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      // Gọi đúng Route đã update: posts/:id/comments/:comment_id
      const res = await fetch(`${BASE_URL}/posts/${post.id}/comments/${cmtId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCommentList(prev => prev.filter(c => c.id !== cmtId));
        setCommentsCount(prev => prev - 1);
      }
    } catch (err) { console.error("Lỗi xóa cmt:", err); }
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-visible hover:shadow-sm transition-shadow">
      <div className="p-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
            <div>
              <p className="text-sm font-bold text-gray-900">{authorName}</p>
              <p className="text-[11px] text-gray-400">{timeAgo(post.created_at)}</p>
            </div>
          </div>

          {isMyPost && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white border rounded-xl shadow-xl z-20 py-1">
                  <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    <Edit2 size={14} /> Chỉnh sửa
                  </button>
                  <button onClick={() => { handleDeletePost(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 size={14} /> Xóa bài
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NỘI DUNG */}
        {isEditing ? (
          <div className="mb-3 space-y-2">
            <textarea
              autoFocus
              className="w-full p-3 bg-gray-50 border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsEditing(false); setEditContent(content); }} className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">Hủy</button>
              <button onClick={handleUpdatePost} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg">Lưu</button>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">{content}</p>
        )}

        {/* ẢNH */}
        {post.image_url && (
          <div className="-mx-4 mb-3">
            <img src={post.image_url} alt="post" className="w-full object-cover max-h-[450px]" loading="lazy" />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm font-medium ${liked ? 'text-red-500' : 'text-gray-400'}`}>
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              <span>{likes}</span>
            </button>
            <button onClick={handleToggleComment} className={`flex items-center gap-1.5 text-sm font-medium ${showComment ? 'text-blue-500' : 'text-gray-400'}`}>
              <MessageCircle size={20} />
              <span>{commentsCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
              <Share2 size={20} />
            </button>
          </div>
          <button onClick={toggleSave} className={`${saved ? 'text-yellow-500' : 'text-gray-400'}`}>
            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* COMMENTS SECTION */}
        {showComment && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2 mb-4">
              <img src={currentUser?.avatar_url || authorAvatar} className="w-8 h-8 rounded-full object-cover" alt="Me" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  className="flex-1 px-3 py-1.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-400"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <button onClick={handleSubmitComment} disabled={!commentInput.trim()} className="text-blue-600 font-bold text-sm disabled:opacity-50">Gửi</button>
              </div>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-2"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
            ) : (
              <div className="space-y-3">
                {commentList.map((cmt) => {
                  const isMyCmt = currentUser && String(currentUser.id) === String(cmt.user?.id || cmt.user_id);
                  return (
                    <div key={cmt.id} className="group flex gap-2 items-start">
                      <img src={cmt.user?.avatar_url || authorAvatar} className="w-7 h-7 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="inline-block bg-gray-100 rounded-2xl px-3 py-1.5 relative">
                          <p className="text-[12px] font-bold text-gray-900">{cmt.user?.username || 'Gopher'}</p>
                          <p className="text-sm text-gray-700">{cmt.content}</p>
                          {isMyCmt && (
                            <button onClick={() => handleDeleteComment(cmt.id)} className="absolute -right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}