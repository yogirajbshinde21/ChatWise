import { ArrowLeft, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="p-2 -ml-2 rounded-full lg:hidden hover:bg-base-300"
          >
            <ArrowLeft className="size-5" />
          </button>

          {/* Avatar */}
          <div className="avatar">
            <div className="relative rounded-full size-10">
              <img 
                src={selectedUser.profilePic || "../assets/avatar.png"} 
                alt={selectedUser.fullName}
                className="object-cover w-full h-full rounded-full" 
              />
            </div>
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button for desktop */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="hidden p-2 rounded-full lg:block hover:bg-base-300"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;