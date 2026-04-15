import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Bell, Settings, LogOut, Users, Bookmark, Zap, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { icon: Home, label: 'Trang chủ', to: '/feed' },
  { icon: MessageCircle, label: 'Tin nhắn', to: '/chat' },
  { icon: Bell, label: 'Thông báo', to: '/notifications' },
  { icon: Users, label: 'Bạn bè', to: '/friends' },
  { icon: Bookmark, label: 'Đã lưu', to: '/saved' },
  { icon: TrendingUp, label: 'Khám phá', to: '/explore' },
  { icon: Settings, label: 'Cài đặt', to: '/settings' },
];

export default function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'Gopher'}&background=0D8ABC&color=fff`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">ConnectVN</span>
        </div>
      </div>

      {/* USER PROFILE SECTION */}
      <div className="px-4 py-4 border-b border-gray-100">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group ${
              isActive ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-gray-50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={user?.avatar_url || defaultAvatar}
                alt={user?.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                  {user?.username || 'Người dùng'}
                </p>
                <p className="text-xs text-gray-500 truncate">Xem trang cá nhân</p>
              </div>
            </>
          )}
        </NavLink>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {label}
                {to === '/chat' && (
                  <span
                    className={`ml-auto text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                    }`}
                  >
                    2
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}