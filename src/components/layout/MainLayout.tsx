import { useEffect } from 'react';
import { Zap, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import RightWidgets from './RightWidgets';
import { useApp } from '../../context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  hideRightWidgets?: boolean;
  fullHeightContent?: boolean;
}

export default function MainLayout({ children, hideRightWidgets, fullHeightContent }: MainLayoutProps) {
  // 🚀 LẤY TẤT CẢ TỪ APP CONTEXT (Tuyệt đối không gọi useWebSocket ở đây để tránh nhân bản luồng)
  const { user, unreadNotifCount, setUnreadNotifCount, latestData, wsConnected } = useApp();

  // Debug để kiểm tra trên trình duyệt
  useEffect(() => {
    if (wsConnected) {
      console.log("🟢 [MainLayout] Đang dùng chung sóng Real-time từ AppContext!");
    }
  }, [wsConnected]);

  // 🚀 BỘ TAI NGHE: Bắt sóng thông báo và nhảy số cái chuông
  useEffect(() => {
    if (!latestData) return;

    if (latestData.type === 'NOTIFICATION') {
      console.log("🔔 Đã bắt được thông báo mới:", latestData.data);
      setUnreadNotifCount((prev: number) => prev + 1);
    }
  }, [latestData, setUnreadNotifCount]);

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
    </div>
  );
}