import { Search, CreditCard as Edit } from 'lucide-react';
import { conversations } from '../../data/mockData';

export default function ConversationList({ selectedId, onSelect }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
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
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${
              selectedId === conv.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={conv.user.avatar_url}
                alt={conv.user.full_name}
                className="w-11 h-11 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                  {conv.user.full_name}
                </p>
                <span className="text-xs text-gray-400 flex-shrink-0">{conv.last_time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate ${conv.unread > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                  {conv.last_message}
                </p>
                {conv.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
