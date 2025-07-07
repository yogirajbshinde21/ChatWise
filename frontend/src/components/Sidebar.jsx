import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {

  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if(isUsersLoading) return <SidebarSkeleton/>
  



  return (
     <aside className="flex flex-col w-full h-full transition-all duration-200 border-r lg:w-72 border-base-300">
      <div className="w-full p-4 border-b border-base-300">
        <div className="flex items-center gap-3">
          <Users className="size-6" />
          <span className="text-lg font-medium">Chats</span>
        </div>
        {/* TODO: Online filter toggle */}
        {/* <div className="items-center hidden gap-2 mt-3 lg:flex">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div> */}
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-4 flex items-center gap-3
              hover:bg-base-300 transition-colors active:bg-base-300
              ${selectedUser?._id === user._id ? "bg-base-300" : ""}
            `}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.profilePic || "../assets/avatar.png"}
                alt={user.name}
                className="object-cover rounded-full size-12"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 bg-green-500 rounded-full size-3 ring-2 ring-white"
                />
              )}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium truncate text-base">{user.fullName}</div>
              <div className="text-sm text-base-content/70">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {users.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p className="text-base-content/60">No contacts yet</p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
