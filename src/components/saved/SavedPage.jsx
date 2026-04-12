import { useState } from 'react';
import { Bookmark, Grid2x2 as Grid, List, Search, Filter } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import PostCard from '../feed/PostCard';
import { posts } from '../../data/mockData';

const savedPosts = posts.slice(0, 2).map(post => ({
  ...post,
  saved_at: '2026-04-10T15:30:00Z',
}));

const collections = [
  { id: 1, name: 'Công nghệ', count: 12, color: 'bg-blue-500' },
  { id: 2, name: 'Du lịch', count: 8, color: 'bg-green-500' },
  { id: 3, name: 'Ẩm thực', count: 15, color: 'bg-orange-500' },
  { id: 4, name: 'Thể thao', count: 6, color: 'bg-purple-500' },
];

function CollectionCard({ collection }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${collection.color} rounded-xl flex items-center justify-center`}>
          <Bookmark size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{collection.name}</h3>
          <p className="text-sm text-gray-500">{collection.count} bài viết</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'posts', label: 'Bài viết', count: savedPosts.length },
    { id: 'collections', label: 'Bộ sưu tập', count: collections.length },
  ];

  const filteredPosts = savedPosts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Đã lưu</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
              <Filter size={18} />
            </button>
            {activeTab === 'posts' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

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
            placeholder={`Tìm kiếm ${activeTab === 'posts' ? 'bài viết' : 'bộ sưu tập'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {activeTab === 'posts' ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}

        {((activeTab === 'posts' && filteredPosts.length === 0) ||
          (activeTab === 'collections' && collections.length === 0)) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'posts' ? 'Chưa có bài viết đã lưu' : 'Chưa có bộ sưu tập'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'posts' 
                ? 'Lưu những bài viết yêu thích để xem lại sau' 
                : 'Tạo bộ sưu tập để sắp xếp nội dung đã lưu'
              }
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}