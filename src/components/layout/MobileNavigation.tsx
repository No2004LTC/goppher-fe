import { Home, MessageCircle, Bell, Users, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { icon: Home, page: 'feed' },
  { icon: Users, page: 'friends' },
  { icon: Bell, page: 'notifications' },
  { icon: MessageCircle, page: 'chat', badge: 2 },
  { icon: Settings, page: 'settings' },
];

export default function MobileNavigation() {
  const { currentPage, setCurrentPage } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, page, badge }) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              currentPage === page ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} strokeWidth={currentPage === page ? 2.5 : 1.8} />
            {badge && (
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
            {currentPage === page && (
              <span className="mt-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
