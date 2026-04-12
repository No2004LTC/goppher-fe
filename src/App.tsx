import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import NewsFeed from './components/feed/NewsFeed';
import ChatLayout from './components/chat/ChatLayout';
import SettingsPage from './components/settings/SettingsPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import FriendsPage from './components/friends/FriendsPage';
import SavedPage from './components/saved/SavedPage';
import ExplorePage from './components/explore/ExplorePage';

function AppContent() {
  const { isAuthenticated, currentPage } = useApp();

  if (!isAuthenticated) {
    return currentPage === 'register' ? <RegisterPage /> : <LoginPage />;
  }

  const pages = {
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

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
