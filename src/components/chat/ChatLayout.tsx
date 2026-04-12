import { useState } from 'react';
import ConversationList from './ConversationList';
import ChatBox from './ChatBox';
import MainLayout from '../layout/MainLayout';

export default function ChatLayout() {
  const [selected, setSelected] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const handleSelect = (conv) => {
    setSelected(conv);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <MainLayout hideRightWidgets>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 7rem)' }}>
        <div className="flex h-full">
          <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 h-full ${showChat ? 'hidden lg:flex' : 'flex'} flex-col`}>
            <ConversationList selectedId={selected?.id} onSelect={handleSelect} />
          </div>

          <div className={`flex-1 h-full ${showChat ? 'flex' : 'hidden lg:flex'} flex-col`}>
            <ChatBox conversation={selected} onBack={handleBack} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
