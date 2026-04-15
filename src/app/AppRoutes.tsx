import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './guards';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// App pages
import FeedPage from '../features/feed/pages/FeedPage';
import ChatPage from '../features/chat/pages/ChatPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import FriendsPage from '../features/friends/pages/FriendsPage';
import SavedPage from '../features/saved/pages/SavedPage';
import ExplorePage from '../features/explore/pages/ExplorePage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect gốc về /feed */}
      <Route path="/" element={<Navigate to="/feed" replace />} />

      {/* Public Only Routes: chỉ truy cập khi chưa đăng nhập */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes: cần đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all: mọi route không xác định → /feed */}
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}
