/**
 * HOME PAGE - Main chat interface with group and 1-on-1 chat support
 * 
 * This component provides:
 * - Tabbed interface for switching between users and groups
 * - Responsive design for mobile and desktop
 * - Real-time updates for both user and group chats
 * - Context-aware chat display based on selection
 * 
 * Key Features:
 * - Mobile-first responsive design
 * - Tab-based navigation between users and groups
 * - Conditional rendering based on selected chat type
 * - Real-time updates and notifications
 */

import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import GroupList from "../components/GroupList";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatRoom from "../components/GroupChatRoom";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();
  const { socket } = useAuthStore();
  const [activeTab, setActiveTab] = useState("users"); // "users" or "groups"

  // Set up socket connection for real-time updates
  useEffect(() => {
    if (socket) {
      // Set socket in group store for real-time updates
      const { setSocket } = useGroupStore.getState();
      setSocket(socket);
    }
  }, [socket]);

  // Determine what to show in the main area
  const getMainContent = () => {
    if (selectedUser) {
      return <ChatContainer />;
    } else if (selectedGroup) {
      return <GroupChatRoom />;
    } else {
      return <NoChatSelected />;
    }
  };

  // Determine if we should show the sidebar or main content on mobile
  const shouldShowSidebar = !selectedUser && !selectedGroup;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center px-2 pt-16 sm:px-4 sm:pt-20">
        <div className="bg-base-100 rounded-none sm:rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)]">
          <div className="flex h-full overflow-hidden rounded-none sm:rounded-lg">
            {/* Sidebar - Mobile: Show only when no chat selected, Desktop: Always show */}
            <div className={`${shouldShowSidebar ? 'flex' : 'hidden lg:flex'} w-full lg:w-auto`}>
              <div className="flex flex-col w-full lg:w-72 border-r border-base-300">
                {/* Tab Navigation */}
                <div className="flex border-b border-base-300">
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === "users" 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setActiveTab("groups")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === "groups" 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Groups
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === "users" ? <Sidebar /> : <GroupList />}
                </div>
              </div>
            </div>
            
            {/* Main Chat Area - Mobile: Show when chat selected, Desktop: Always show */}
            <div className={`${shouldShowSidebar ? 'hidden lg:flex' : 'flex'} flex-1`}>
              {getMainContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;