import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import NewsFeed from './components/feed/NewsFeed';
import ChatLayout from './components/chat/ChatLayout';
import SettingsPage from './components/settings/SettingsPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import FriendsPage from './components/friends/FriendsPage';
import SavedPage from './components/saved/SavedPage';
import ExplorePage from './components/explore/ExplorePage';
import LoadingSpinner from './components/common/LoadingSpinner'; // Đảm bảo đúng đường dẫn nhé

function AppContent() {
  const { isAuthenticated, user, currentPage } = useApp();

  // 1. Ưu tiên các trang Auth (Login/Register)
  if (currentPage === 'register') return <RegisterPage />;
  if (currentPage === 'login') return <LoginPage />;

  // 2. Nếu chưa Login (không có token/isAuthenticated = false) -> Bắt vào Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 3. Nếu đã Login nhưng user object chưa load kịp -> Hiện loading cho "xịn"
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    );
  }

  // 4. Các trang nội bộ (Chỉ hiện khi đã có User)
  const pages: Record<string, JSX.Element> = {
    feed: <NewsFeed />,
    chat: <ChatLayout />,
    settings: <SettingsPage />,
    notifications: <NotificationsPage />,
    friends: <FriendsPage />,
    saved: <SavedPage />,
    explore: <ExplorePage />,
  };

  return pages[currentPage] || <NewsFeed />;
}

// CỰC KỲ QUAN TRỌNG: Dòng này để main.tsx không báo lỗi "export named default"
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}