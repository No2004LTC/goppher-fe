import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Edit2, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import PostCard from '../../feed/components/PostCard';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user: currentUser, token, setUser } = useApp();
    const navigate = useNavigate();

    const isMyProfile = true; // Hiện tại trang này luôn là trang của mình
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null); // Ref cho ảnh bìa

    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);

    // State lưu số lượng
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // Lấy thông tin User (Bắt buộc phải có)
                const userRes = await fetch(`${BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userRes.ok) {
                    const result = await userRes.json();
                    setProfileUser(result.data || result);
                }

                // Gọi các API còn lại SONG SONG để tối ưu tốc độ
                const [postsRes, followersRes, followingRes] = await Promise.allSettled([
                    fetch(`${BASE_URL}/posts/user/${currentUser?.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${BASE_URL}/users/followers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${BASE_URL}/users/following`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                // 1. Xử lý bài viết
                if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
                    const postsData = await postsRes.value.json();
                    setUserPosts(postsData.data || []);
                }

                // 2. Xử lý Followers (Người theo dõi mình)
                if (followersRes.status === 'fulfilled' && followersRes.value.ok) {
                    const followersData = await followersRes.value.json();
                    // Giả sử API trả về mảng danh sách người dùng trong data
                    setFollowersCount(followersData.data?.length || 0);
                }

                // 3. Xử lý Following (Người mình đang theo dõi)
                if (followingRes.status === 'fulfilled' && followingRes.value.ok) {
                    const followingData = await followingRes.value.json();
                    setFollowingCount(followingData.data?.length || 0);
                }

            } catch (error) {
                console.error("Lỗi hệ thống:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [token, BASE_URL, currentUser?.id]);

    // --- XỬ LÝ UPLOAD AVATAR ---
    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (fileInputRef.current) fileInputRef.current.value = '';

        const formData = new FormData();
        formData.append('avatar', file);

        setUploadingAvatar(true);
        const toastId = toast.loading("Đang tải ảnh lên...");

        try {
            const res = await fetch(`${BASE_URL}/users/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Cập nhật ảnh đại diện thành công!", { id: toastId });
                setProfileUser((prev: any) => ({ ...prev, avatar_url: result.data.url }));
                if (setUser && currentUser) {
                    setUser({ ...currentUser, avatar_url: result.data.url });
                }
            } else {
                toast.error(result.error || "Không thể tải ảnh lên", { id: toastId });
            }
        } catch (error) {
            toast.error("Lỗi kết nối server", { id: toastId });
        } finally {
            setUploadingAvatar(false);
        }
    };

    // --- MOCK HÀM UPLOAD ẢNH BÌA ---
    const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast('Chức năng upload Ảnh Bìa đang chờ Backend thêm trường cover_url!', { icon: '🚧' });
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                </div>
            </MainLayout>
        );
    }

    if (!profileUser) {
        return (
            <MainLayout>
                <div className="text-center py-20 text-gray-500 font-medium">Không tìm thấy người dùng này.</div>
            </MainLayout>
        );
    }

    const avatar = profileUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`;

    return (
        <MainLayout>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-sm">

                {/* Ảnh bìa */}
                {/* Tương lai cậu truyền cover_url vào style background-image ở đây nhé */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-sky-300 relative group">
                    {isMyProfile && (
                        <>
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-xl backdrop-blur-md transition flex items-center gap-2 text-sm font-semibold shadow-lg"
                            >
                                <ImageIcon size={16} /> Thay ảnh bìa
                            </button>
                            <input
                                type="file"
                                ref={coverInputRef}
                                onChange={handleCoverChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </>
                    )}
                </div>

                <div className="px-8 relative pb-8">
                    {/* Ảnh đại diện */}
                    <div className="absolute -top-16 flex items-end gap-4">
                        <div className="relative group">
                            <img
                                src={avatar}
                                className={`w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-xl transition ${uploadingAvatar ? 'opacity-50' : 'group-hover:brightness-90'}`}
                                alt="avatar"
                            />

                            {uploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}

                            {isMyProfile && !uploadingAvatar && (
                                <>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg border-2 border-white transition-transform hover:scale-105"
                                        title="Thay đổi ảnh đại diện"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        accept="image/jpeg, image/png, image/webp"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-4 mb-8">
                        <button
                            onClick={() => navigate('/settings')}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center gap-2 transition"
                        >
                            <Edit2 size={16} /> Chỉnh sửa hồ sơ
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="mt-2">
                        <h1 className="text-2xl font-black text-gray-900">{profileUser.username}</h1>
                        <p className="text-gray-500 font-semibold mt-0.5">@{profileUser.username}</p>

                        <p className="mt-5 text-gray-800 leading-relaxed max-w-2xl text-[15px]">
                            {profileUser.bio || "Bạn chưa có tiểu sử. Hãy vào phần Cài đặt để thêm vài dòng giới thiệu về bản thân nhé!"}
                        </p>

                        <div className="flex items-center gap-6 mt-5 text-sm text-gray-500 font-semibold">
                            <div className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> Hà Nội, Việt Nam</div>
                            <div className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> Tham gia gần đây</div>
                        </div>

                        {/* Stats - ĐÃ CẬP NHẬT DỮ LIỆU THẬT */}
                        <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-50">
                            <div className="text-center cursor-pointer hover:opacity-80 transition">
                                <span className="block font-black text-xl text-gray-900">{userPosts.length}</span>
                                <span className="text-sm text-gray-500 font-medium">Bài viết</span>
                            </div>
                            <div className="text-center cursor-pointer hover:opacity-80 transition">
                                <span className="block font-black text-xl text-gray-900">{followersCount}</span>
                                <span className="text-sm text-gray-500 font-medium">Người theo dõi</span>
                            </div>
                            <div className="text-center cursor-pointer hover:opacity-80 transition">
                                <span className="block font-black text-xl text-gray-900">{followingCount}</span>
                                <span className="text-sm text-gray-500 font-medium">Đang theo dõi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Timeline */}
            <div className="flex gap-6">
                <div className="w-full lg:w-2/3 space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 font-black text-gray-900 text-lg shadow-sm">
                        Bài viết của bạn
                    </div>

                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onDelete={(deletedId: number) => setUserPosts(prev => prev.filter(p => p.id !== deletedId))}
                            />
                        ))
                    ) : (
                        <div className="bg-white py-16 rounded-2xl border border-gray-100 text-center shadow-sm">
                            <p className="text-gray-500 font-medium">Bạn chưa có bài viết nào.</p>
                            <button className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition">
                                Tạo bài viết đầu tiên
                            </button>
                        </div>
                    )}
                </div>

                {/* Cột phụ */}
                <div className="hidden lg:block w-1/3">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-24 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-3 text-lg">Giới thiệu</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Chào mừng đến với không gian cá nhân của <span className="font-bold">{profileUser.username}</span>. Nơi chia sẻ những khoảnh khắc và kết nối với mọi người.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}