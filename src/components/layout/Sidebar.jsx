import { Home, MessageCircle, Bell, Settings, LogOut, Users, Bookmark, Zap, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { icon: Home, label: 'Trang chủ', page: 'feed' },
  { icon: MessageCircle, label: 'Tin nhắn', page: 'chat' },
  { icon: Bell, label: 'Thông báo', page: 'notifications' },
  { icon: Users, label: 'Bạn bè', page: 'friends' },
  { icon: Bookmark, label: 'Đã lưu', page: 'saved' },
  { icon: TrendingUp, label: 'Khám phá', page: 'explore' },
  { icon: Settings, label: 'Cài đặt', page: 'settings' },
];

export default function Sidebar() {
  const { user, currentPage, setCurrentPage, logout } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ConnectVN</span>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition">
          <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-400 truncate">@{user.username}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, page }) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              currentPage === page
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={20} />
            {label}
            {page === 'chat' && (
              <span className="ml-auto bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
