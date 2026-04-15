import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Bell, Users, Settings } from 'lucide-react';

const navItems = [
  { icon: Home, to: '/feed' },
  { icon: Users, to: '/friends' },
  { icon: Bell, to: '/notifications' },
  { icon: MessageCircle, to: '/chat', badge: 2 },
  { icon: Settings, to: '/settings' },
];

export default function MobileNavigation() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge && (
                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <span className="mt-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
