import { useState } from 'react';
import { posts as initialPosts, users } from '../../data/mockData';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import MainLayout from '../layout/MainLayout';

function StoryItem({ user, isOwn }) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
      <div className={`w-14 h-14 rounded-full ${isOwn ? 'bg-blue-100 border-2 border-dashed border-blue-400' : 'ring-2 ring-blue-500 ring-offset-2'} overflow-hidden relative`}>
        {isOwn ? (
          <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-light">+</div>
        ) : (
          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        )}
      </div>
      <span className="text-xs text-gray-600 font-medium max-w-[60px] truncate">
        {isOwn ? 'Của bạn' : user.full_name.split(' ').slice(-1)[0]}
      </span>
    </div>
  );
}

export default function NewsFeed() {
  const [posts, setPosts] = useState(initialPosts);

  const handleNewPost = (post) => {
    setPosts([post, ...posts]);
  };

  return (
    <MainLayout>
      <div className="space-y-4 pb-20 lg:pb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            <StoryItem isOwn />
            {users.map((u) => (
              <StoryItem key={u.id} user={u} />
            ))}
          </div>
        </div>

        <CreatePost onPost={handleNewPost} />

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium px-2">Bài viết mới nhất</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </MainLayout>
  );
}
