import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Edit2, Loader2, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import PostCard from '../../feed/components/PostCard';
import { useApp } from '../../../context/AppContext';
import toast from 'react-hot-toast';

interface PublicUser {
  id: number;
  username: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  // 🚀 LẤY THÊM onlineMap TỪ CONTEXT
  const { user: currentUser, token, onlineMap } = useApp();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  const isMyProfile = !!currentUser && currentUser.username === username;

  useEffect(() => {
    if (!username || !token) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/users/profile/${username}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          setProfileUser(null);
          return;
        }

        const result = await res.json();
        const data: PublicUser = result.data || result;
        setProfileUser(data);
        setFollowing(!!data.is_following);

        if (data.id) {
          const postsRes = await fetch(`${BASE_URL}/posts/user/${data.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setUserPosts(postsData.data || []);
          }
        }
      } catch (err) {
        console.error('Lỗi tải profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, token, BASE_URL]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setFollowLoading(true);
    const prevFollowing = following;
    setFollowing(!prevFollowing);

    try {
      const res = await fetch(`${BASE_URL}/users/follow/${profileUser.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        setFollowing(prevFollowing);
        toast.error('Thao tác thất bại. Vui lòng thử lại.');
      } else {
        toast.success(prevFollowing ? 'Đã hủy theo dõi' : `Đang theo dõi ${profileUser.username}`);
        setProfileUser(prev => prev ? {
          ...prev,
          followers_count: (prev.followers_count || 0) + (prevFollowing ? -1 : 1),
          is_following: !prevFollowing,
        } : prev);
      }
    } catch {
      setFollowing(prevFollowing);
      toast.error('Lỗi kết nối server');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-gray-500 font-medium">
          <p className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy người dùng</p>
          <p className="text-sm">@{username} không tồn tại hoặc đã xóa tài khoản.</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">Quay lại</button>
        </div>
      </MainLayout>
    );
  }

  const avatar = profileUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`;
  
  // 🚀 DÒ BẢN ĐỒ XEM NGƯỜI NÀY CÓ ĐANG ONLINE KHÔNG
  const isActuallyOnline = profileUser.id ? onlineMap[String(profileUser.id)] === true : false;

  return (
    <MainLayout>
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-sky-300 relative" style={profileUser.cover_url ? { backgroundImage: `url(${profileUser.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
        <div className="px-8 relative pb-8">
          <div className="absolute -top-16 flex items-end gap-4">
            <div className="relative">
              <img src={avatar} className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-xl" alt={profileUser.username} />
              {/* 🚀 CHẤM ONLINE NẢY THEO REAL-TIME */}
              {isActuallyOnline && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 mb-8 gap-3">
            {isMyProfile ? (
              <button onClick={() => navigate('/settings')} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center gap-2 transition"><Edit2 size={16} /> Chỉnh sửa hồ sơ</button>
            ) : (
              <>
                <button onClick={() => profileUser?.id && navigate(`/chat?to_user=${profileUser.id}`)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"><MessageCircle size={16} /> Nhắn tin</button>
                <button onClick={handleFollowToggle} disabled={followLoading} className={`px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-all shadow-md disabled:opacity-60 ${following ? 'bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}>
                  {followLoading ? <Loader2 size={16} className="animate-spin" /> : following ? <><UserCheck size={16} /> Đang theo dõi</> : <><UserPlus size={16} /> Theo dõi</>}
                </button>
              </>
            )}
          </div>

          <div className="mt-2">
            <h1 className="text-2xl font-black text-gray-900">{profileUser.username}</h1>
            <p className="text-gray-500 font-semibold mt-0.5">@{profileUser.username}</p>
            <p className="mt-5 text-gray-800 leading-relaxed max-w-2xl text-[15px]">{profileUser.bio || (isMyProfile ? 'Bạn chưa có tiểu sử.' : `${profileUser.username} chưa có tiểu sử.`)}</p>
            <div className="flex items-center gap-6 mt-5 text-sm text-gray-500 font-semibold">
              <div className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> Việt Nam</div>
              <div className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> Thành viên ConnectVN</div>
            </div>
            <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-50">
              <div className="text-center cursor-pointer hover:opacity-80 transition"><span className="block font-black text-xl text-gray-900">{profileUser.posts_count ?? userPosts.length}</span><span className="text-sm text-gray-500 font-medium">Bài viết</span></div>
              <div className="text-center cursor-pointer hover:opacity-80 transition"><span className="block font-black text-xl text-gray-900">{profileUser.followers_count ?? 0}</span><span className="text-sm text-gray-500 font-medium">Người theo dõi</span></div>
              <div className="text-center cursor-pointer hover:opacity-80 transition"><span className="block font-black text-xl text-gray-900">{profileUser.following_count ?? 0}</span><span className="text-sm text-gray-500 font-medium">Đang theo dõi</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 font-black text-gray-900 text-lg shadow-sm">Bài viết của {profileUser.username}</div>
          {userPosts.length > 0 ? userPosts.map(post => <PostCard key={post.id} post={post} />) : <div className="bg-white py-16 rounded-2xl border border-gray-100 text-center shadow-sm"><p className="text-gray-500 font-medium">{isMyProfile ? 'Bạn chưa có bài viết nào.' : `${profileUser.username} chưa có bài viết nào.`}</p></div>}
        </div>
        <div className="hidden lg:block w-1/3">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-24 shadow-sm">
            <h3 className="font-black text-gray-900 mb-3 text-lg">Giới thiệu</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{profileUser.bio ? profileUser.bio : `Chào mừng đến với không gian cá nhân của `}{!profileUser.bio && <span className="font-bold">{profileUser.username}</span>}{!profileUser.bio && '. Nơi chia sẻ những khoảnh khắc và kết nối với mọi người.'}</p>
            {!isMyProfile && <button onClick={handleFollowToggle} disabled={followLoading} className={`w-full mt-4 py-2 font-bold rounded-xl text-sm transition ${following ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{following ? 'Đang theo dõi' : 'Theo dõi'}</button>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}