import { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Lock, Bell, Shield, Palette, Globe, ChevronRight, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import ChangePasswordForm from '../components/ChangePasswordForm';
import MainLayout from '../../../components/layout/MainLayout';
import { useApp } from '../../../context/AppContext';
import toast from 'react-hot-toast';

const sections = [
  { id: 'profile', icon: UserIcon, label: 'Thông tin cá nhân', desc: 'Tên, ảnh đại diện, tiểu sử' },
  { id: 'password', icon: Lock, label: 'Đổi mật khẩu', desc: 'Bảo mật tài khoản của bạn' },
  { id: 'notifications', icon: Bell, label: 'Thông báo', desc: 'Tùy chỉnh loại thông báo nhận' },
  { id: 'privacy', icon: Shield, label: 'Quyền riêng tư', desc: 'Ai có thể xem hồ sơ của bạn' },
];

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function ProfileSection() {
  const { user, token, setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 1. State giữ ảnh được chọn (chưa upload)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string>('');

  // 2. State giữ Text
  const [formData, setFormData] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || ''
      });
      setPreviewAvatar(user.avatar_url || ''); // Khởi tạo ảnh từ DB
    }
  }, [user]);

  const triggerSuccess = () => {
    setSuccessStatus(true);
    setTimeout(() => setSuccessStatus(false), 3000);
  };

  // --- KHI NGƯỜI DÙNG CHỌN ẢNH (CHỈ XEM TRƯỚC) ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Giữ file lại
      setPreviewAvatar(URL.createObjectURL(file)); // Tạo link ảo để hiện hình ngay lập tức
    }
  };

  // --- KHI ẤN "LƯU THAY ĐỔI" (XỬ LÝ TẤT CẢ) ---
  const handleSaveAll = async () => {
    setLoading(true);
    let hasChanges = false;
    let finalAvatarUrl = previewAvatar; // Mặc định là ảnh cũ

    try {
      // BƯỚC 1: Nếu có chọn ảnh mới -> Gọi API Upload Avatar
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('avatar', selectedFile);

        const resAvatar = await fetch(`${BASE_URL}/users/avatar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadData
        });

        if (resAvatar.ok) {
          const result = await resAvatar.json();
          finalAvatarUrl = result.data.url; // Lấy URL thật từ MinIO/S3 trả về
          hasChanges = true;
        } else {
          toast.error("Tải ảnh lên thất bại");
          setLoading(false);
          return; // Dừng lại nếu lỗi ảnh
        }
      }

      // BƯỚC 2: Kiểm tra Text có thay đổi không -> Gọi API Update Profile
      const payload: any = {};
      if (formData.username && formData.username !== user?.username) payload.username = formData.username;
      if (formData.bio !== user?.bio) payload.bio = formData.bio;

      if (Object.keys(payload).length > 0) {
        const resProfile = await fetch(`${BASE_URL}/users/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (resProfile.ok) {
          hasChanges = true;
        } else {
          toast.error("Cập nhật thông tin thất bại");
          setLoading(false);
          return;
        }
      }

      // BƯỚC 3: Kết thúc & Bật Flash
      if (hasChanges) {
        if (setUser && user) {
          // Cập nhật mọi thứ vào Context
          setUser({ ...user, ...payload, avatar_url: finalAvatarUrl });
        }
        setSelectedFile(null); // Clear file sau khi up xong
        triggerSuccess();      // Kích hoạt nháy Flash
      } else if (!selectedFile && Object.keys(payload).length === 0) {
        triggerSuccess(); // Không sửa gì mà cứ ấn Lưu thì cho nháy cho vui mắt
      }

    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="space-y-6 relative">
      {successStatus && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center animate-in slide-in-from-top duration-300 z-10">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-200">
            <CheckCircle2 size={14} /> Cập nhật thành công!
          </div>
        </div>
      )}

      {/* --- AVATAR BẤM VÀO ĐỂ XEM TRƯỚC --- */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className={`relative group cursor-pointer p-1 rounded-full border-2 transition-colors duration-500 ${successStatus ? 'border-green-400 scale-105' : 'border-transparent'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <img
            src={previewAvatar || DEFAULT_AVATAR}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover bg-gray-100 shadow-md group-hover:brightness-90 transition"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera size={24} className="text-white drop-shadow-md" />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {selectedFile ? "Ảnh chưa được lưu" : "Nhấp để thay đổi ảnh"}
        </p>
      </div>

      <div className="space-y-4">
        <div className={`transition-all duration-500 p-1 rounded-2xl ${successStatus ? 'bg-green-50' : ''}`}>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">Tên hiển thị</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        <div className={`transition-all duration-500 p-1 rounded-2xl ${successStatus ? 'bg-green-50' : ''}`}>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">Tiểu sử</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSaveAll}
        disabled={loading}
        className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${successStatus ? 'bg-green-500 shadow-green-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
          }`}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : successStatus ? <CheckCircle2 size={20} /> : "Lưu thay đổi"}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('profile');

  const renderContent = () => {
    switch (active) {
      case 'profile': return <ProfileSection />;
      case 'password': return <ChangePasswordForm />; // Nó sẽ render UI mới toanh ở đây
      default: return <div className="py-20 text-center text-gray-400 italic">Tính năng sắp ra mắt...</div>;
    }
  };

  return (
    <MainLayout hideRightWidgets>
      <div className="max-w-5xl mx-auto pb-20">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Cài đặt</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2 sticky top-4">
              {sections.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={20} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold">{label}</p>
                    {active !== id && <p className="text-[10px] opacity-50 truncate">{desc}</p>}
                  </div>
                  {active === id && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[500px]">
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                {sections.find((s) => s.id === active)?.label}
              </h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}