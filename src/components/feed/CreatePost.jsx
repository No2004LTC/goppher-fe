import { useState, useRef } from 'react';
import { Image, Smile, MapPin, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProgressBar from '../common/ProgressBar';

export default function CreatePost({ onPost }) {
  const { user } = useApp();
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadProgress(0);
      const url = URL.createObjectURL(file);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      
      setImagePreview(url);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setUploadProgress(0);
    
    // Simulate posting progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
    
    await new Promise((r) => setTimeout(r, 600));
    const newPost = {
      id: Date.now(),
      user_id: user.id,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: content.trim(),
      image_url: imagePreview,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    };
    onPost(newPost);
    setContent('');
    setImagePreview(null);
    setUploadProgress(0);
    setPosting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1">
          <textarea
            placeholder={`${user.full_name} ơi, bạn đang nghĩ gì vậy?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent leading-relaxed"
          />

          {imagePreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden">
              <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover" />
              {uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <ProgressBar 
                    progress={uploadProgress} 
                    color="white" 
                    size="sm" 
                    showPercentage={false}
                  />
                </div>
              )}
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 w-6 h-6 bg-gray-900 bg-opacity-60 text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {posting && (
        <div className="mt-3 px-4 py-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-blue-700 font-medium">Đang đăng bài...</span>
          </div>
          <ProgressBar 
            progress={uploadProgress} 
            color="blue" 
            size="sm"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImage} />
          <button
            onClick={() => fileRef.current.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition"
          >
            <Image size={16} className="text-green-500" />
            Ảnh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition">
            <Smile size={16} className="text-yellow-400" />
            Cảm xúc
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition">
            <MapPin size={16} className="text-red-400" />
            Check-in
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || posting}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {posting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Đăng
        </button>
      </div>
    </div>
  );
}
