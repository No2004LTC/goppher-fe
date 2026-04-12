import { Zap, Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import RightWidgets from './RightWidgets';
import { useApp } from '../../context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  hideRightWidgets?: boolean;
}

export default function MainLayout({ children, hideRightWidgets }: MainLayoutProps) {
  const { user } = useApp();

  // Tạo một avatar mặc định nếu user chưa có ảnh
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=0D8ABC&color=fff`;

  return (
    <div className="min-h-screen bg-gray-50">
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
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
          </button>
          <img
            src={user?.avatar_url || defaultAvatar}
            alt={user?.username}
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
          />
        </div>
      </header>

      <div className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 pt-16 lg:pt-0">
          <div className="flex gap-6 py-6">
            <main className="flex-1 min-w-0">{children}</main>
            {!hideRightWidgets && <RightWidgets />}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}