import { useState } from 'react';
import { Search, Edit } from 'lucide-react';

export default function ConversationList({ conversations, loading, selectedId, onSelect }: any) {
  // Thêm tính năng tìm kiếm cục bộ mượt mà không cần gọi lại API
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv: any) =>
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
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
                  className="w-11 h-11 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                    {conv.user.username}
                  </p>
                  {/* Hiển thị số tin chưa đọc */}
                  {conv.unread > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {conv.unread > 99 ? '99+' : conv.unread}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${conv.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                  {conv.last_message || 'Nhấn để bắt đầu trò chuyện...'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}