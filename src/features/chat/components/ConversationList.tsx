import { useState } from 'react';
import { Search, Edit } from 'lucide-react';

export default function ConversationList({ friends = [], strangers = [], loading, selectedId, onSelect }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'strangers'>('friends');

  const activeList = activeTab === 'friends' ? friends : strangers;

  const filteredConversations = activeList.filter((conv: any) =>
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm chuyển đổi thời gian rút gọn
  const formatTime = (isoString?: string) => {
    if (!isoString || isoString.startsWith('0001')) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `vài giây`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}p`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}g`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}n`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header & Thanh tìm kiếm */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Tin nhắn</h2>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition">
            <Edit size={18} />
          </button>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-2 ${activeTab === 'friends' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'
            }`}
        >
          Bạn bè
        </button>
        <button
          onClick={() => setActiveTab('strangers')}
          className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-2 ${activeTab === 'strangers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'
            }`}
        >
          Người lạ / Chờ
        </button>
      </div>

      {/* Danh sách người dùng */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-400">Đang tải danh bạ...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">
            {searchTerm ? 'Không tìm thấy kết quả.' : 'Chưa có cuộc trò chuyện nào.'}
          </div>
        ) : (
          filteredConversations.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${selectedId === conv.id ? 'bg-blue-50' : ''
                }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conv.user.avatar_url || `https://ui-avatars.com/api/?name=${conv.user.username}&background=random`}
                  alt={conv.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conv.is_online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-[15px] truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                    {conv.user.username}
                  </p>
                  <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap ml-2">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-[13px] truncate pr-2 ${conv.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-400 italic'}`}>
                    {conv.last_message || 'Bắt đầu cuộc trò chuyện ngay...'}
                  </p>
                  {/* Hiển thị số tin chưa đọc */}
                  {conv.unread > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {conv.unread > 99 ? '99+' : conv.unread}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}