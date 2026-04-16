import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Bell, Users, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { icon: Home, to: '/feed' },
  { icon: Users, to: '/friends' },
  { icon: Bell, to: '/notifications' },
  { icon: MessageCircle, to: '/chat' },
  { icon: Settings, to: '/settings' },
];

export default function MobileNavigation() {
  const { unreadChatCount, unreadNotifCount, setIsNotifPanelOpen } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, to }) => {
          let badgeCount = 0;
          if (to === '/chat') badgeCount = unreadChatCount;
          if (to === '/notifications') badgeCount = unreadNotifCount;

          return (
          <NavLink
            key={to}
            to={to}
            onClick={(e) => {
              if (to === '/notifications') {
                e.preventDefault();
                setIsNotifPanelOpen(true);
              }
            }}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
                {badgeCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
                {isActive && (
                  <span className="mt-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        )})}
      </div>
    </nav>
  );
}
