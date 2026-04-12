function timeStr(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isSent, senderAvatar }) {
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
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isSent
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{timeStr(message.created_at)}</span>
      </div>
    </div>
  );
}
