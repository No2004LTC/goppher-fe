import { useState } from 'react';
import { Search, UserPlus, UserCheck, MessageCircle, MoreHorizontal } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { users } from '../../data/mockData';

const friendRequests = [
  {
    id: 1,
    user: {
      id: 6,
      username: 'anna.tran',
      full_name: 'Trần Anna',
      avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    mutualFriends: 5,
    time: '2 ngày trước',
  },
  {
    id: 2,
    user: {
      id: 7,
      username: 'david.le',
      full_name: 'Lê David',
      avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    mutualFriends: 2,
    time: '1 tuần trước',
  },
];

const suggestions = [
  {
    id: 8,
    username: 'sarah.nguyen',
    full_name: 'Nguyễn Sarah',
    avatar_url: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    mutualFriends: 8,
  },
  {
    id: 9,
    username: 'john.pham',
    full_name: 'Phạm John',
    avatar_url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    mutualFriends: 3,
  },
];

function FriendCard({ user, type = 'friend', onAction }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <img 
          src={user.avatar_url} 
          alt={user.full_name} 
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.full_name}</h3>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
          {user.mutualFriends && (
            <p className="text-xs text-gray-400 mt-1">{user.mutualFriends} bạn chung</p>
          )}
          {type === 'request' && user.time && (
            <p className="text-xs text-gray-400 mt-1">{user.time}</p>
          )}
        </div>
        <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        {type === 'request' ? (
          <>
            <button 
              onClick={() => onAction?.('accept', user.id)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
            >
              Chấp nhận
            </button>
            <button 
              onClick={() => onAction?.('decline', user.id)}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
            >
              Từ chối
            </button>
          </>
        ) : type === 'suggestion' ? (
          <>
            <button 
              onClick={() => onAction?.('add', user.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
            >
              <UserPlus size={14} />
              Kết bạn
            </button>
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition">
              <MessageCircle size={14} />
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition">
              <UserCheck size={14} />
              Bạn bè
            </button>
            <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">
              <MessageCircle size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'friends', label: 'Bạn bè', count: users.length },
    { id: 'requests', label: 'Lời mời', count: friendRequests.length },
    { id: 'suggestions', label: 'Gợi ý', count: suggestions.length },
  ];

  const handleAction = (action, userId) => {
    console.log(`${action} user ${userId}`);
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Bạn bè</h1>

        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTab === 'friends' && filteredUsers.map((user) => (
            <FriendCard key={user.id} user={user} type="friend" onAction={handleAction} />
          ))}
          
          {activeTab === 'requests' && friendRequests.map((request) => (
            <FriendCard key={request.id} user={request.user} type="request" onAction={handleAction} />
          ))}
          
          {activeTab === 'suggestions' && suggestions.map((user) => (
            <FriendCard key={user.id} user={user} type="suggestion" onAction={handleAction} />
          ))}
        </div>

        {((activeTab === 'friends' && filteredUsers.length === 0) ||
          (activeTab === 'requests' && friendRequests.length === 0) ||
          (activeTab === 'suggestions' && suggestions.length === 0)) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'friends' && 'Không tìm thấy bạn bè'}
              {activeTab === 'requests' && 'Chưa có lời mời kết bạn'}
              {activeTab === 'suggestions' && 'Chưa có gợi ý kết bạn'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'friends' && 'Thử tìm kiếm với từ khóa khác'}
              {activeTab === 'requests' && 'Lời mời kết bạn sẽ xuất hiện ở đây'}
              {activeTab === 'suggestions' && 'Gợi ý kết bạn sẽ xuất hiện ở đây'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}