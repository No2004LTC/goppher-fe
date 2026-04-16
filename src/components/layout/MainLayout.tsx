import { Zap, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom'; // 👉 Thêm import Link
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import RightWidgets from './RightWidgets';
import { useApp } from '../../context/AppContext';
import { useWebSocket } from '../../hooks/useWebSocket';

interface MainLayoutProps {
  children: React.ReactNode;
  hideRightWidgets?: boolean;
  fullHeightContent?: boolean; // Khi true: content không có scroll, dung lượng cố định theo viewport (dùng cho Chat)
}

export default function MainLayout({ children, hideRightWidgets, fullHeightContent }: MainLayoutProps) {
  // 👉 Đã xóa setIsNotifPanelOpen vì không dùng Panel nữa
  const { user, token, unreadNotifCount } = useApp();

  // 🔌 KÍCH HOẠT WEBSOCKET TOÀN CỤC
  // Khi MainLayout render, Hook này sẽ chạy và báo cho Redis là User đang Online
  const WS_URL = token
    ? `ws://localhost:8080/api/v1/ws?token=${token}`
    : null;

  const { isConnected } = useWebSocket(WS_URL);

  // Debug để kiểm tra trên trình duyệt
  if (isConnected) {
    console.log("🟢 Hệ thống Real-time đã sẵn sàng!");
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=0D8ABC&color=fff`;

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <Sidebar />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">ConnectVN</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <Search size={20} />
          </button>

          {/* 👉 Sửa nút Chuông thành thẻ Link nhảy sang trang /notifications */}
          <Link
            to="/notifications"
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative"
          >
            <Bell size={20} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            )}
          </Link>

          <img
            src={user?.avatar_url || defaultAvatar}
            alt={user?.username}
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
          />
        </div>
      </header>

      <div className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 pt-16 lg:pt-0">
          {fullHeightContent ? (
            // Chat layout: chiếu cao cố định, không bị MobileNav che
            <div className="py-3 pb-[72px] lg:pb-6 lg:py-6">
              <main className="min-w-0">{children}</main>
            </div>
          ) : (
            <div className="flex gap-6 py-6 pb-24 lg:pb-6">
              <main className="flex-1 min-w-0">{children}</main>
              {!hideRightWidgets && <RightWidgets />}
            </div>
          )}
        </div>
      </div>

      <MobileNavigation />
      {/* 👉 Đã xóa <NotificationPanel /> ở đây */}
    </div>
  );
}