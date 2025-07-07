import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center px-2 pt-16 sm:px-4 sm:pt-20">
        <div className="bg-base-100 rounded-none sm:rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)]">
          <div className="flex h-full overflow-hidden rounded-none sm:rounded-lg">
            {/* Mobile: Show sidebar OR chat, Desktop: Show both */}
            <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto`}>
              <Sidebar />
            </div>
            
            {/* Mobile: Show chat when user selected, Desktop: Always show */}
            <div className={`${selectedUser ? 'flex' : 'hidden lg:flex'} flex-1`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;