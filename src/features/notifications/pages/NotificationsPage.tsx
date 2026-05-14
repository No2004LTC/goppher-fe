import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Settings, Loader2, Bookmark, CheckCheck } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import { useApp } from '../../../context/AppContext';

interface Actor {
  id: number;
  username: string;
  avatar_url?: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor: Actor;
}

// Helper tính thời gian
function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'vừa xong';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}p trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

// Component con hiển thị từng dòng thông báo
function NotificationItem({ notification, onMarkAsRead }: { notification: Notification; onMarkAsRead: (id: number) => void }) {
  const getIcon = () => {
    const iconProps = { size: 16, className: 'text-white' };
    switch (notification.type.toLowerCase()) {
      case 'like': return <Heart {...iconProps} fill="currentColor" />;
      case 'comment': return <MessageCircle {...iconProps} />;
      case 'follow': return <UserPlus {...iconProps} />;
      case 'save': return <Bookmark {...iconProps} fill="currentColor" />;
      default: return <Bell {...iconProps} />;
    }
  };

  const getIconBg = () => {
    switch (notification.type.toLowerCase()) {
      case 'like': return 'bg-red-500';
      case 'comment': return 'bg-blue-500';
      case 'follow': return 'bg-green-500';
      case 'save': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const senderAvatar = notification.actor?.avatar_url || `https://ui-avatars.com/api/?name=${notification.actor?.username || 'U'}&background=random`;

  return (
    <div
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
      className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition cursor-pointer ${!notification.is_read ? 'bg-blue-50/40' : ''}`}
    >
      <div className="relative">
        <img src={senderAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="avatar" />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getIconBg()} rounded-full flex items-center justify-center ring-2 ring-white shadow-sm`}>
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
          <span className="font-bold text-gray-900">{notification.actor?.username}</span> {notification.message}
        </p>
        <p className="text-xs mt-1 text-gray-400">{timeAgo(notification.created_at)}</p>
      </div>
      {!notification.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
    </div>
  );
}

export default function NotificationsPage() {
  // 🚀 CHỈ DÙNG useApp() ĐỂ LẤY SÓNG, BỎ useWebSocket()
  const { token, latestData, setUnreadNotifCount, unreadNotifCount } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 1. Lấy dữ liệu cũ từ API
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setNotifications(Array.isArray(result) ? result : (result.data || []));
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 2. Lắng nghe Real-time thông qua Context
  useEffect(() => {
    if (!latestData) return;

    if (latestData.type === 'NOTIFICATION') {
      const data = latestData.data;
      console.log("🔔 [Realtime] Thông báo mới trên Trang:", data);

      if (!data.actor?.username || !data.id) {
        fetchNotifications();
        return;
      }

      const newNotif: Notification = {
        id: data.id,
        type: data.type || 'system',
        message: data.message || 'đã tương tác với bạn',
        is_read: false,
        created_at: data.created_at || new Date().toISOString(),
        actor: data.actor
      };

      setNotifications(prev => {
        if (prev.some(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestData]);

  const handleMarkAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    // 🚀 TRỪ ĐI 1 THÔNG BÁO CHƯA ĐỌC TRÊN HEADER
    setUnreadNotifCount(prev => Math.max(0, prev - 1));

    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadNotifCount === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadNotifCount(0);

    try {
      await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <div className="flex items-center gap-2">
            {unreadNotifCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-full transition"
              >
                <CheckCheck size={18} />
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : notifications.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y">
            {notifications.map(n => (
              <NotificationItem key={n.id} notification={n} onMarkAsRead={handleMarkAsRead} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <Bell size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Chưa có thông báo nào</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}