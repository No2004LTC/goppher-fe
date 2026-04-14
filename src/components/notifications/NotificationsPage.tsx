import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Settings, Loader2, Bookmark } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { useApp } from '../../context/AppContext';
import { useWebSocket } from '../../hooks/useWebSocket'; // NẠP VŨ KHÍ TỐI THƯỢNG

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

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'vừa xong';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

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

  const senderName = notification.actor?.username || 'Người dùng';
  const senderAvatar = notification.actor?.avatar_url || `https://ui-avatars.com/api/?name=${senderName}&background=0D8ABC&color=fff`;

  return (
    <div
      onClick={() => {
        if (!notification.is_read) onMarkAsRead(notification.id);
      }}
      className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition cursor-pointer ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
    >
      <div className="relative">
        <img src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getIconBg()} rounded-full flex items-center justify-center ring-2 ring-white shadow-sm`}>
          {getIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
          <span className="font-bold text-gray-900">{senderName}</span>{' '}
          <span>{notification.message}</span>
        </p>
        <p className={`text-xs mt-1.5 ${!notification.is_read ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {!notification.is_read && (
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2 shadow-sm shadow-blue-200" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { token } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const WS_URL = token ? `ws://localhost:8080/api/v1/ws?token=${token}` : null;

  // 1. KÉO LỊCH SỬ THÔNG BÁO LÚC MỚI VÀO
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setNotifications(Array.isArray(result) ? result : (result.data || []));
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  // 2. LẮNG NGHE REAL-TIME (KHÔNG CẦN RELOAD)
  // 2. LẮNG NGHE REAL-TIME (TỐI ƯU HÓA)
  useWebSocket(WS_URL, (data: any) => {
    if (data.type === 'NOTIFICATION') {
      // 1. Gắn Radar để cậu tự xem Backend đang gửi cái gì (Bấm F12 tab Console để xem)
      console.log("🔥 WEBSOCKET THÔNG BÁO TỚI:", data);

      // 2. Khui gói tin WebSocket (Bao lô cả trường hợp Object lồng nhau: data.actor.username)
      const incomingNotif: Notification = {
        id: data.id || Date.now(),
        type: data.notification_type || data.type || 'system',
        message: data.message || data.content || 'đã tương tác với bạn',
        is_read: false,
        created_at: data.created_at || new Date().toISOString(),
        actor: {
          id: data.actor?.id || data.actor_id || data.from_user_id || 0,
          username: data.actor?.username || data.actor_name || 'Hệ thống',
          avatar_url: data.actor?.avatar_url || data.actor_avatar || ''
        }
      };

      // 3. BỘ LỌC THÔNG MINH:
      // Nếu gói tin WS quá nghèo nàn, thiếu hẳn tên người dùng (Bị gán là 'Hệ thống')
      // => Lập tức gọi ngầm hàm fetchNotifications() để kéo bản chuẩn từ DB lên ngay tắp lự!
      if (incomingNotif.actor.username === 'Hệ thống' || !incomingNotif.actor.id) {
        console.log("🔄 Gói tin WS thiếu data, đang tự động gọi lại API ngầm...");
        fetchNotifications();
        return;
      }

      // Nếu gói tin WS đã đầy đủ xịn xò, thì nhét thẳng lên đầu mảng
      setNotifications((prev) => {
        // Chống lặp thông báo
        const isDuplicate = prev.some(n => n.id === incomingNotif.id);
        if (isDuplicate) return prev;
        return [incomingNotif, ...prev];
      });
    }
  });

  const handleMarkAsRead = async (id: number) => {
    setNotifications(prev => prev.map(noti => noti.id === id ? { ...noti, is_read: true } : noti));
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
            {unreadCount > 0 && <p className="text-sm font-medium text-blue-600 mt-1">{unreadCount} thông báo mới</p>}
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"><Settings size={20} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : notifications.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Bell size={32} className="text-gray-300" /></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thông báo</h3>
          </div>
        )}
      </div>
    </MainLayout>
  );
}