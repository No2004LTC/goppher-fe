import { useState, useRef, useEffect } from 'react';
import { Image, Smile, X, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import ProgressBar from '../../../components/ui/ProgressBar';

// 1. Khai báo Interface cho Props
interface CreatePostProps {
  onPostSuccess?: (newPost: any) => void;
}

export default function CreatePost({ onPostSuccess }: CreatePostProps) {
  const { user, token } = useApp();

  const [content, setContent] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [posting, setPosting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 2. Thêm type cho useRef
  const fileRef = useRef<HTMLInputElement>(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // Dọn dẹp URL rác để tránh tràn RAM trình duyệt
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // 3. Thêm type cho Event
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return;

    setPosting(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      setUploadProgress(50);

      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type ở đây, để fetch tự lo liệu
        },
        body: formData,
      });

      setUploadProgress(80);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể đăng bài');
      }

      setUploadProgress(100);

      if (onPostSuccess) {
        onPostSuccess(data.data);
      }

      // Reset form
      setContent('');
      setImagePreview(null);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = ''; // Reset cả input file

    } catch (err: any) {
      console.error("Lỗi đăng bài:", err);
      alert(err.message);
    } finally {
      setTimeout(() => {
        setPosting(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=0D8ABC&color=fff`}
          alt={user?.username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100"
        />
        <div className="flex-1">
          <textarea
            // ĐÃ SỬA CHỖ NÀY: Bỏ full_name đi để chiều lòng TypeScript
            placeholder={`${user?.username || 'Gopher'} ơi, bạn đang nghĩ gì vậy?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent leading-relaxed"
          />

          {imagePreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
              <img src={imagePreview} alt="preview" className="w-full max-h-64 object-contain" />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setSelectedFile(null);
                  if (fileRef.current) fileRef.current.value = '';
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-gray-900/60 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {posting && (
        <div className="mt-3 px-4 py-3 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Đang đẩy dữ liệu lên MinIO...
            </span>
            <span className="text-xs text-blue-600 font-bold">{uploadProgress}%</span>
          </div>
          <ProgressBar progress={uploadProgress} />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileRef}
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImage}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <Image size={18} className="text-green-500" />
            Ảnh/Video
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition">
            <Smile size={18} className="text-yellow-500" />
            Cảm xúc
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={(!content.trim() && !selectedFile) || posting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
        >
          Đăng bài
        </button>
      </div>
    </div>
  );
}