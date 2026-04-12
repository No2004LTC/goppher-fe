import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreHorizontal, Smile, Image, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../common/LoadingSpinner';
import { useWebSocket } from '../../hooks/useWebSocket';
import { initialMessages, autoReplies } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function ChatBox({ conversation, onBack }) {
  const { user } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const WS_URL = null;

  const { sendMessage: wsSend } = useWebSocket(WS_URL, (data) => {
    const incoming = {
      id: Date.now() + 1,
      sender_id: conversation.user.id,
      receiver_id: user.id,
      content: data.content || autoReplies[Math.floor(Math.random() * autoReplies.length)],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, incoming]);
    setIsTyping(false);
  });

  useEffect(() => {
    if (conversation) {
      setMessages(initialMessages[conversation.id] || []);
      setInput('');
      inputRef.current?.focus();
    }
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: conversation.user.id,
      content: input.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setIsTyping(true);

    wsSend(msg);

    setTimeout(() => {
      const reply = {
        id: Date.now() + 2,
        sender_id: conversation.user.id,
        receiver_id: user.id,
        content: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Send size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium">Chọn một cuộc trò chuyện</p>
        <p className="text-xs mt-1">để bắt đầu nhắn tin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        {onBack && (
          <button onClick={onBack} className="mr-1 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition lg:hidden">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="relative">
          <img src={conversation.user.avatar_url} alt={conversation.user.full_name} className="w-9 h-9 rounded-full object-cover" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{conversation.user.full_name}</p>
          <p className="text-xs text-green-500 font-medium">Đang hoạt động</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
            <Phone size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
            <Video size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSent={msg.sender_id === user.id}
            senderAvatar={conversation.user.avatar_url}
          />
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            <img src={conversation.user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
              <LoadingSpinner size="sm" color="gray" />
              <span className="text-xs text-gray-500 ml-2">Đang nhập...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition flex-shrink-0">
            <Image size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition flex-shrink-0">
            <Smile size={20} />
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-end">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none max-h-24"
              style={{ lineHeight: '1.5' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
