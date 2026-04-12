import { Search, UserPlus } from 'lucide-react';
import { users } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const trends = [
  { tag: '#ReactJS', posts: '12.4K bài viết' },
  { tag: '#WebDev', posts: '8.1K bài viết' },
  { tag: '#ViệtNam', posts: '45.2K bài viết' },
  { tag: '#TailwindCSS', posts: '3.7K bài viết' },
  { tag: '#JavaScript', posts: '22.9K bài viết' },
];

function FriendSuggestion({ user }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <img src={user.avatar_url} alt={user.full_name} className="w-9 h-9 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
      </div>
      <button className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg transition">
        <UserPlus size={12} />
        Kết bạn
      </button>
    </div>
  );
}

export default function RightWidgets() {
  const { setCurrentPage } = useApp();

  return (
    <aside className="hidden xl:block w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Xu hướng hôm nay</h3>
          <div className="space-y-2">
            {trends.map((t) => (
              <div key={t.tag} className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition">
                <div>
                  <p className="text-sm font-semibold text-blue-600">{t.tag}</p>
                  <p className="text-xs text-gray-400">{t.posts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Gợi ý kết bạn</h3>
          <div className="divide-y divide-gray-50">
            {users.slice(0, 4).map((user) => (
              <FriendSuggestion key={user.id} user={user} />
            ))}
          </div>
          <button
            onClick={() => setCurrentPage('friends')}
            className="mt-3 w-full text-center text-sm text-blue-600 hover:underline font-medium"
          >
            Xem tất cả gợi ý
          </button>
        </div>

        <p className="text-xs text-gray-400 px-1 leading-relaxed">
          © 2026 ConnectVN · Điều khoản · Bảo mật · Cookie · Quảng cáo
        </p>
      </div>
    </aside>
  );
}
