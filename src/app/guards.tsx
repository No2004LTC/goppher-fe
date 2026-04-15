import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * ProtectedRoute: Bảo vệ các route cần đăng nhập.
 * Nếu chưa xác thực → redirect về /login
 * Nếu xác thực nhưng chưa load user → hiển thị spinner
 */
export function ProtectedRoute() {
  const { isAuthenticated, user } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    );
  }

  return <Outlet />;
}

/**
 * PublicOnlyRoute: Chỉ truy cập được khi chưa đăng nhập (login, register).
 * Nếu đã xác thực → redirect về /feed
 */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useApp();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
