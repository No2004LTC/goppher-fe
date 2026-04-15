import { useState, useEffect } from 'react';
import { MapPin, Calendar, Edit2, Loader2, Image as ImageIcon } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import PostCard from '../../feed/components/PostCard'; // Cậu đã sửa đúng đường dẫn ở máy cậu
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    // 1. Dùng thẳng Context
    const { user: currentUser, token } = useApp();
    const navigate = useNavigate();

    const isMyProfile = true; // Hiện tại trang này luôn là trang của mình

    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

    useEffect(() => {
        const fetchProfileAndPosts = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // 1. LẤY THÔNG TIN PROFILE TỪ ROUTE /me
                const userRes = await fetch(`${BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userRes.ok) {
                    const result = await userRes.json();
                    // Thường Gopher sẽ trả về { data: { ...user } }
                    setProfileUser(result.data || result);
                } else {
                    console.error("Lỗi gọi API /me:", userRes.status);
                }

                // 2. LẤY BÀI VIẾT (Tạm thời cứ để đây, nếu BE báo 404 thì nó sẽ hiện "Chưa có bài viết")
                try {
                    const postsRes = await fetch(`${BASE_URL}/posts?user_id=${currentUser?.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (postsRes.ok) {
                        const postsData = await postsRes.json();
                        setUserPosts(postsData.data || []);
                    }
                } catch (err) {
                    console.log("API Posts chưa sẵn sàng hoặc lỗi 404");
                }

            } catch (error) {
                console.error("Lỗi hệ thống:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndPosts();
    }, [token, BASE_URL, currentUser?.id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            </MainLayout>
        );
    }

    if (!profileUser) {
        return (
            <MainLayout>
                <div className="text-center py-20 text-gray-500">Không tìm thấy người dùng này.</div>
            </MainLayout>
        );
    }

    const avatar = profileUser.avatar_url || `https://ui-avatars.com/api/?name=${profileUser.username}&background=random`;

    return (
        <MainLayout>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                {/* Ảnh bìa */}
                <div className="h-48 bg-gradient-to-r from-blue-400 to-sky-300 relative group">
                    {isMyProfile && (
                        <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2 text-sm font-medium">
                            <ImageIcon size={16} /> Thay ảnh bìa
                        </button>
                    )}
                </div>

                <div className="px-6 relative pb-6">
                    {/* Avatar */}
                    <div className="absolute -top-16 flex items-end gap-4">
                        <div className="relative group">
                            <img src={avatar} className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-md" alt="avatar" />
                            {isMyProfile && (
                                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm border-2 border-white">
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-4 mb-8">
                        <button
                            onClick={() => navigate('/settings')} // 👉 Nhảy sang trang Cài đặt
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl flex items-center gap-2 transition"
                        >
                            <Edit2 size={16} /> Chỉnh sửa trang cá nhân
                        </button>
                    </div>

                    {/* User Info */}
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">{profileUser.username}</h1>
                        <p className="text-gray-500 font-medium">@{profileUser.username}</p>

                        <p className="mt-4 text-gray-800 leading-relaxed max-w-2xl">
                            {profileUser.bio || "Bạn chưa có tiểu sử. Hãy vào phần Cài đặt để thêm vài dòng giới thiệu về bản thân nhé!"}
                        </p>

                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5"><MapPin size={16} /> Hà Nội, Việt Nam</div>
                            <div className="flex items-center gap-1.5"><Calendar size={16} /> Tham gia gần đây</div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                            <div className="text-center"><span className="block font-bold text-lg text-gray-900">{userPosts.length}</span><span className="text-sm text-gray-500">Bài viết</span></div>
                            <div className="text-center"><span className="block font-bold text-lg text-gray-900">0</span><span className="text-sm text-gray-500">Người theo dõi</span></div>
                            <div className="text-center"><span className="block font-bold text-lg text-gray-900">0</span><span className="text-sm text-gray-500">Đang theo dõi</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Timeline */}
            <div className="flex gap-6">
                <div className="w-full lg:w-2/3 space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 font-bold text-gray-900 text-lg">
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
                        <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center text-gray-500">
                            Bạn chưa có bài viết nào.
                        </div>
                    )}
                </div>

                {/* Cột phụ */}
                <div className="hidden lg:block w-1/3">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4">Giới thiệu</h3>
                        <p className="text-sm text-gray-600">Đây là khu vực hiển thị thêm các thông tin chi tiết, liên kết mạng xã hội hoặc hình ảnh nổi bật.</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}