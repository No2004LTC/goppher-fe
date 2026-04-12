import { useState } from 'react';
import { User, Lock, Bell, Shield, Palette, Globe, ChevronRight, Camera } from 'lucide-react';
import ChangePasswordForm from './ChangePasswordForm';
import MainLayout from '../layout/MainLayout';
import { useApp } from '../../context/AppContext';

const sections = [
  { id: 'profile', icon: User, label: 'Thông tin cá nhân', desc: 'Tên, ảnh đại diện, tiểu sử' },
  { id: 'password', icon: Lock, label: 'Đổi mật khẩu', desc: 'Bảo mật tài khoản của bạn' },
  { id: 'notifications', icon: Bell, label: 'Thông báo', desc: 'Tùy chỉnh loại thông báo nhận' },
  { id: 'privacy', icon: Shield, label: 'Quyền riêng tư', desc: 'Ai có thể xem hồ sơ của bạn' },
  { id: 'appearance', icon: Palette, label: 'Giao diện', desc: 'Chủ đề và màu sắc' },
  { id: 'language', icon: Globe, label: 'Ngôn ngữ', desc: 'Tiếng Việt' },
];

function ProfileSection() {
  const { user } = useApp();
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <img src={user.avatar_url} alt={user.full_name} className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100" />
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
            <Camera size={13} />
          </button>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{user.full_name}</p>
          <p className="text-sm text-gray-400">@{user.username}</p>
        </div>
      </div>

      {[
        { label: 'Họ và tên', value: user.full_name, key: 'full_name' },
        { label: 'Tên đăng nhập', value: user.username, key: 'username' },
        { label: 'Email', value: user.email, key: 'email' },
        { label: 'Tiểu sử', value: 'Chưa có tiểu sử...', key: 'bio' },
      ].map(({ label, value, key }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <input
            type="text"
            defaultValue={value}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      ))}

      <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
        Lưu thay đổi
      </button>
    </div>
  );
}

function NotificationsSection() {
  const [settings, setSettings] = useState({
    likes: true, comments: true, messages: true, friends: true, mentions: false, news: false,
  });
  const items = [
    { key: 'likes', label: 'Lượt thích bài viết' },
    { key: 'comments', label: 'Bình luận mới' },
    { key: 'messages', label: 'Tin nhắn' },
    { key: 'friends', label: 'Lời mời kết bạn' },
    { key: 'mentions', label: 'Đề cập (@)' },
    { key: 'news', label: 'Tin tức & cập nhật' },
  ];
  return (
    <div className="space-y-3">
      {items.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700">{label}</span>
          <button
            onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PrivacySection() {
  return (
    <div className="space-y-4">
      {[
        { label: 'Ai có thể xem hồ sơ', options: ['Công khai', 'Bạn bè', 'Chỉ mình tôi'], value: 'Bạn bè' },
        { label: 'Ai có thể gửi tin nhắn', options: ['Tất cả', 'Bạn bè', 'Không ai'], value: 'Bạn bè' },
        { label: 'Ai có thể xem bài viết', options: ['Công khai', 'Bạn bè', 'Chỉ mình tôi'], value: 'Công khai' },
      ].map(({ label, options, value }) => (
        <div key={label}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <select defaultValue={value} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

const sectionContent = {
  profile: <ProfileSection />,
  password: <ChangePasswordForm />,
  notifications: <NotificationsSection />,
  privacy: <PrivacySection />,
  appearance: <p className="text-sm text-gray-500 py-4">Tính năng đang phát triển...</p>,
  language: <p className="text-sm text-gray-500 py-4">Hiện tại chỉ hỗ trợ Tiếng Việt.</p>,
};

export default function SettingsPage() {
  const [active, setActive] = useState('profile');

  return (
    <MainLayout hideRightWidgets>
      <div className="pb-20 lg:pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Cài đặt</h1>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {sections.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${
                    active === id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active === id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon size={18} className={active === id ? 'text-blue-600' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${active === id ? 'text-blue-700' : 'text-gray-800'}`}>{label}</p>
                    <p className="text-xs text-gray-400 truncate">{desc}</p>
                  </div>
                  <ChevronRight size={15} className={active === id ? 'text-blue-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                {sections.find((s) => s.id === active)?.label}
              </h2>
              {sectionContent[active]}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
