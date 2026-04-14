import React from 'react';

// Hàm format thời gian có thêm tính năng chống lỗi (fallback)
function timeStr(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return ''; // Tránh lỗi Invalid Date
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// Khai báo áo giáp TypeScript
interface MessageBubbleProps {
  message: any;
  isSent: boolean;
  senderAvatar: string;
}

export default function MessageBubble({ message, isSent, senderAvatar }: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isSent && (
        <img
          src={senderAvatar}
          alt="avatar"
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
        />
      )}

      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isSent
              ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
            }`}
        >
          {message?.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {timeStr(message?.created_at)}
        </span>
      </div>
    </div>
  );
}