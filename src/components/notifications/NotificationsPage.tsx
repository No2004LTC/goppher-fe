import { Bell, Heart, MessageCircle, UserPlus, Settings } from 'lucide-react';
import MainLayout from '../layout/MainLayout';

const notifications = [
  {
    id: 1,
    type: 'like',
    user: 'Trần Linh',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'đã thích bài viết của bạn',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    user: 'Nguyễn Hùng',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'đã bình luận về bài viết của bạn: "Tuyệt vời quá!"',
    time: '15 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'friend',
    user: 'Phạm Mai',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'đã gửi lời mời kết bạn',
    time: '1 giờ trước',
    read: true,
  },
  {
    id: 4,
    type: 'message',
    user: 'Lê Đức',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    content: 'đã gửi tin nhắn cho bạn',
    time: '2 giờ trước',
    read: true,
  },
];

function NotificationItem({ notification }) {
  const getIcon = () => {
    const iconProps = { size: 16, className: 'text-white' };
    switch (notification.type) {
      case 'like': return <Heart {...iconProps} />;
      case 'comment': return <MessageCircle {...iconProps} />;
      case 'friend': return <UserPlus {...iconProps} />;
      case 'message': return <MessageCircle {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  const getIconBg = () => {
    switch (notification.type) {
      case 'like': return 'bg-red-500';
      case 'comment': return 'bg-blue-500';
      case 'friend': return 'bg-green-500';
      case 'message': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}>
      <div className="relative">
        <img 
          src={notification.avatar} 
          alt={notification.user} 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getIconBg()} rounded-full flex items-center justify-center`}>
          {getIcon()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{notification.user}</span> {notification.content}
        </p>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
      </div>
      
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">{unreadCount} thông báo chưa đọc</p>
            )}
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
            <Settings size={20} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>

        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thông báo</h3>
            <p className="text-gray-500 text-sm">Khi có hoạt động mới, chúng sẽ xuất hiện ở đây</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}