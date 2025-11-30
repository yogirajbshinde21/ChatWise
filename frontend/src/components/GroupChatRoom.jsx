/**
 * GROUP CHAT ROOM COMPONENT - Enhanced chat interface for group conversations
 * 
 * This component provides:
 * - Group message display with sender info
 * - Real-time message streaming
 * - Read receipts for group messages
 * - Message sending with image support
 * - Member list display
 * - Admin controls for group management
 * 
 * Key Features:
 * - Mobile-responsive design
 * - Delayed seen marking for performance
 * - Real-time typing indicators
 * - Group member management UI
 * - Message search and filtering
 */

import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Users, Send, Image as ImageIcon, Crown, UserPlus, UserMinus, Settings, X, ArrowLeft, Sparkles, Info } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

// Custom CSS for Chatty effects
const chattyStyles = `
.chatty-input-container {
  position: relative;
  padding: 2px;
  border-radius: 12px;
  background: linear-gradient(
    45deg,
    transparent, transparent, transparent, transparent, 
    transparent, transparent, transparent, transparent
  );
  background-size: 300% 300%;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition-property: background, box-shadow, transform;
}

.chatty-input-container.active {
  background: linear-gradient(
    45deg,
    #8b5cf6, #3b82f6, #06b6d4, #10b981, 
    #f59e0b, #ef4444, #ec4899, #8b5cf6
  );
  background-size: 300% 300%;
  animation: chatty-border-flow 2s linear infinite;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  transform: scale(1.02);
}

.chatty-input-container:not(.active) {
  background: linear-gradient(
    45deg,
    rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1), 
    rgba(6, 182, 212, 0.1), rgba(16, 185, 129, 0.1), 
    rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1), 
    rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1)
  );
  background-size: 300% 300%;
  animation: chatty-border-subtle 4s ease-in-out infinite;
}

.chatty-input-inner {
  background: white;
  border-radius: 10px;
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  font-weight: 500; /* Added medium font weight for better readability */
  color: #374151; /* Slightly darker text color for better contrast */
}

.dark .chatty-input-inner {
  background: #1f2937;
  color: #f3f4f6;
}

@keyframes chatty-border-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes chatty-border-subtle {
  0%, 100% {
    background-position: 0% 50%;
    opacity: 0.3;
  }
  50% {
    background-position: 100% 50%;
    opacity: 0.6;
  }
}

.chatty-hint {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  border-radius: 50%;
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: help;
  transition: all 0.3s ease;
}

.chatty-hint:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.chatty-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #1f2937;
  color: white;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}

.chatty-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

.chatty-hint:hover .chatty-tooltip {
  opacity: 1;
  visibility: visible;
}

.sparkle-float {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
`;

const GroupChatRoom = () => {
    const { authUser, socket } = useAuthStore();
    const { users, getUsers, isUsersLoading } = useChatStore();
    const {
        selectedGroup,
        groupMessages,
        isGroupMessagesLoading,
        getGroupMessages,
        sendGroupMessage,
        markMessagesAsSeen,
        updateGroupLastSeen,
        addGroupMembers,
        removeGroupMember,
        deleteGroup,
        setSelectedGroup,
        setSocket
    } = useGroupStore();

    const [newMessage, setNewMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showMemberList, setShowMemberList] = useState(false);
    const [showGroupSettings, setShowGroupSettings] = useState(false);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const seenTimeoutRef = useRef(null);

    // Check if message contains !Chatty for special effects
    const isChattyMessage = newMessage.toLowerCase().includes('!chatty');

    // Inject custom styles for Chatty effects
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = chattyStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Set up socket connection and real-time subscriptions
    useEffect(() => {
        if (socket) {
            setSocket(socket);
            
            // Subscribe to group events - this ensures events work even in chat room
            const groupStore = useGroupStore.getState();
            groupStore.subscribeToGroupEvents();

            console.log("🔄 GroupChatRoom: Socket events subscribed");
        }
    }, [socket, setSocket]);

    // Initialize group messages when selectedGroup changes
    useEffect(() => {
        if (selectedGroup) {
            console.log("🔄 Loading messages for group:", selectedGroup.name);
            getGroupMessages(selectedGroup._id);
            updateGroupLastSeen(selectedGroup._id);
        }
    }, [selectedGroup, getGroupMessages, updateGroupLastSeen]);

    // Re-subscribe to events when group changes to ensure real-time updates
    useEffect(() => {
        if (selectedGroup && socket) {
            console.log("🔄 Re-subscribing to group events for:", selectedGroup.name);
            const groupStore = useGroupStore.getState();
            groupStore.subscribeToGroupEvents();
        }
    }, [selectedGroup, socket]);

    // Initialize users for adding to group
    useEffect(() => {
        getUsers();
    }, [getUsers]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log("🔄 Messages updated, count:", groupMessages.length);
    }, [groupMessages]);

    // Delayed seen marking for performance optimization
    useEffect(() => {
        if (groupMessages.length > 0) {
            const newUnseenMessages = groupMessages.filter(msg => 
                msg.senderId._id !== authUser._id && 
                !msg.isSeenBy?.(authUser._id)
            ).map(msg => msg._id);

            if (newUnseenMessages.length > 0) {
                // Clear existing timeout
                if (seenTimeoutRef.current) {
                    clearTimeout(seenTimeoutRef.current);
                }

                // Set new timeout for delayed seen marking (2 second delay)
                seenTimeoutRef.current = setTimeout(() => {
                    markMessagesAsSeen(selectedGroup._id, newUnseenMessages);
                }, 2000);
            }
        }

        return () => {
            if (seenTimeoutRef.current) {
                clearTimeout(seenTimeoutRef.current);
            }
        };
    }, [groupMessages, authUser._id, markMessagesAsSeen, selectedGroup._id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() && !selectedImage) return;

        try {
            const messageData = {
                text: newMessage,
                ...(selectedImage && { image: selectedImage }),
            };

            await sendGroupMessage(selectedGroup._id, messageData);
            setNewMessage("");
            setSelectedImage(null);
        } catch {
            // Error handled in store
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await removeGroupMember(selectedGroup._id, memberId);
        } catch {
            // Error handled in store
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            try {
                await deleteGroup(selectedGroup._id);
            } catch {
                // Error handled in store
            }
        }
    };

    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;

        try {
            await addGroupMembers(selectedGroup._id, selectedUsers);
            setSelectedUsers([]);
            setShowAddMembers(false);
        } catch {
            // Error handled in store
        }
    };

    const handleUserToggle = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    // Get available users that can be added to the group
    const getAvailableUsers = () => {
        if (!selectedGroup || !users || users.length === 0) {
            return [];
        }
        
        const groupMemberIds = selectedGroup.members.map(member => member._id);
        const availableUsers = users.filter(user => 
            !groupMemberIds.includes(user._id) && user._id !== authUser._id
        );
        
        return availableUsers;
    };

    const isAdmin = selectedGroup?.admin._id === authUser._id;

    if (!selectedGroup) {
        return (
            <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-base-content/50" />
                    <h3 className="mb-2 text-lg font-semibold">Select a Group</h3>
                    <p className="text-base-content/60">
                        Choose a group from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Group Header - Sticky on mobile */}
            <div className="sticky top-0 z-10 p-3 border-b border-base-300 sm:p-4 bg-base-100 sm:static sm:z-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0 gap-3">
                        {/* Back button for mobile */}
                        <button 
                            onClick={() => setSelectedGroup(null)}
                            className="p-1 -ml-1 rounded-full lg:hidden hover:bg-base-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="relative flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-primary/10">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            {isAdmin && (
                                <Crown className="absolute w-3 h-3 text-yellow-500 -top-1 -right-1" />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate sm:text-base">{selectedGroup.name}</h3>
                            <p className="text-xs sm:text-sm text-base-content/70">
                                {selectedGroup.members.length} member{selectedGroup.members.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center flex-shrink-0 gap-1 sm:gap-2">
                        <button
                            onClick={() => setShowMemberList(true)}
                            className="btn btn-xs sm:btn-sm btn-ghost"
                            title="View Members"
                        >
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        
                        {isAdmin && (
                            <button
                                onClick={() => setShowGroupSettings(true)}
                                className="btn btn-xs sm:btn-sm btn-ghost"
                                title="Group Settings"
                            >
                                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto sm:p-4 sm:space-y-4">
                {isGroupMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : groupMessages.length === 0 ? (
                    <div className="py-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 sm:w-16 sm:h-16 text-base-content/50" />
                        <h3 className="mb-2 text-base font-semibold sm:text-lg">No Messages Yet</h3>
                        <p className="text-sm sm:text-base text-base-content/60">
                            Start the conversation by sending the first message
                        </p>
                    </div>
                ) : (
                    <>
                        {groupMessages.map((message) => (
                            <div
                                key={message._id}
                                className={`chat ${message.senderId._id === authUser._id ? "chat-end" : "chat-start"}`}
                            >
                                <div className="chat-image avatar">
                                    <div className="w-8 h-8 rounded-full sm:w-10 sm:h-10">
                                        <img
                                            src={message.senderId.profilePic || "/avatar.png"}
                                            alt={message.senderId.fullName}
                                            className="object-cover w-full h-full rounded-full"
                                        />
                                    </div>
                                </div>
                                
                                <div className="chat-header">
                                    <span className="text-xs font-medium sm:text-sm">
                                        {message.senderId.fullName}
                                    </span>
                                    <time className="ml-1 text-xs opacity-50">
                                        {formatMessageTime(message.createdAt)}
                                    </time>
                                </div>
                                
                                <div className={`max-w-xs sm:max-w-md chat-bubble ${
                                    message.senderId._id === authUser._id 
                                        ? 'chat-bubble-primary bg-primary text-primary-content' 
                                        : 'chat-bubble-secondary bg-base-200 text-base-content'
                                }`}>
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Shared image"
                                            className="max-w-full mb-2 transition-opacity rounded-lg cursor-pointer hover:opacity-90"
                                            onClick={() => window.open(message.image, '_blank')}
                                        />
                                    )}
                                    {message.text && <p className="text-sm sm:text-base">{message.text}</p>}
                                    {message.isChatty && (
                                        <div className="mt-1 badge badge-accent badge-sm">
                                            Chatty
                                        </div>
                                    )}
                                </div>
                                
                                {/* Read receipts with avatars */}
                                {message.senderId._id === authUser._id && message.seenBy && (
                                    <div className="chat-footer opacity-70">
                                        <div className="flex items-center gap-2 mt-1">
                                            {message.seenBy.length > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="text-xs text-base-content/70">
                                                        Seen by {message.seenBy.length}
                                                    </div>
                                                    <div className="flex -space-x-2">
                                                        {message.seenBy.slice(0, 3).map((seenUser) => {
                                                            // Find the user in the group members
                                                            const member = selectedGroup.members.find(m => m._id === seenUser.user);
                                                            return member ? (
                                                                <div key={seenUser.user} className="w-4 h-4 overflow-hidden border rounded-full border-base-content/20">
                                                                    <img
                                                                        src={member.profilePic || "/avatar.png"}
                                                                        alt={member.fullName}
                                                                        className="object-cover w-full h-full"
                                                                        title={`${member.fullName} - ${new Date(seenUser.seenAt).toLocaleTimeString()}`}
                                                                    />
                                                                </div>
                                                            ) : null;
                                                        })}
                                                        {message.seenBy.length > 3 && (
                                                            <div className="flex items-center justify-center w-4 h-4 border rounded-full bg-base-300 border-base-content/20">
                                                                <span className="text-xs font-medium">+{message.seenBy.length - 3}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-base-content/50">
                                                    Delivered
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-base-300 sm:p-4">
                {selectedImage && (
                    <div className="mb-3">
                        <div className="relative inline-block">
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="object-cover w-16 h-16 rounded-lg sm:w-20 sm:h-20"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 btn btn-xs sm:btn-sm btn-circle btn-error"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-sm btn-ghost"
                        title="Attach Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    
                    {/* !Chatty Feature Hint - Positioned near input */}
                    <div className="chatty-hint">
                        <span>?</span>
                        <div className="chatty-tooltip">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="font-semibold text-purple-300">!Chatty AI Feature</span>
                            </div>
                            <p className="mb-2">Type <span className="px-1 font-mono text-purple-300 bg-gray-800 rounded">!Chatty</span> in your message for AI summaries!</p>
                            <p className="text-xs text-gray-400">Example: "!Chatty Let's discuss the project"</p>
                        </div>
                    </div>
                    
                    {/* Enhanced Message Input with Dynamic Chatty Border Effects */}
                    <div className={`chatty-input-container ${isChattyMessage ? 'active' : ''} flex-1`}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isChattyMessage ? "✨ AI-powered message activated! ✨" : "Type a message..."}
                            className={`chatty-input-inner px-4 py-3 text-sm sm:text-base transition-all duration-300 ${
                                isChattyMessage 
                                ? 'placeholder-purple-600 text-gray-800 font-medium' 
                                : 'placeholder-gray-500'
                            }`}
                        />
                        
                        {isChattyMessage && (
                            <div className="absolute z-20 transform -translate-y-1/2 pointer-events-none right-3 top-1/2">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full shadow-sm bg-white/80">
                                    <Sparkles className="w-3 h-3 text-purple-600" />
                                    <span className="text-xs font-bold text-purple-700">AI</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className={`btn btn-sm sm:btn-md transition-all duration-300 ${
                            isChattyMessage 
                            ? 'btn-primary bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 border-none text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                            : 'btn-primary'
                        }`}
                    >
                        {isChattyMessage ? (
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                <Send className="w-4 h-4" />
                            </div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </form>

            {/* Member List Modal */}
            {showMemberList && (
                <div className="modal modal-open">
                    <div className="w-full max-w-md modal-box">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Group Members</h3>
                            <button
                                onClick={() => setShowMemberList(false)}
                                className="btn btn-sm btn-ghost"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto max-h-96">
                            {selectedGroup.members.map((member) => (
                                <div key={member._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-10 h-10 rounded-full">
                                                <img
                                                    src={member.profilePic || "/avatar.png"}
                                                    alt={member.fullName}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium">{member.fullName}</p>
                                            {member._id === selectedGroup.admin._id && (
                                                <p className="flex items-center gap-1 text-xs text-yellow-600">
                                                    <Crown className="w-3 h-3" />
                                                    Admin
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {isAdmin && member._id !== authUser._id && member._id !== selectedGroup.admin._id && (
                                        <button
                                            onClick={() => handleRemoveMember(member._id)}
                                            className="btn btn-sm btn-error btn-ghost"
                                            title="Remove Member"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {isAdmin && (
                            <div className="pt-4 mt-4 border-t border-base-300">
                                <button
                                    onClick={() => {
                                        setShowMemberList(false);
                                        setShowAddMembers(true);
                                    }}
                                    className="w-full btn btn-primary btn-sm"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add More Members
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Group Settings Modal */}
            {showGroupSettings && (
                <div className="modal modal-open">
                    <div className="w-full max-w-md modal-box">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Group Settings</h3>
                            <button
                                onClick={() => setShowGroupSettings(false)}
                                className="btn btn-sm btn-ghost"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Group Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={selectedGroup.name}
                                    className="input input-bordered"
                                    readOnly
                                />
                            </div>
                            
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea
                                    value={selectedGroup.description || "No description"}
                                    className="textarea textarea-bordered"
                                    readOnly
                                />
                            </div>
                            
                            <div className="divider"></div>
                            
                            <div className="space-y-2">
                                <button 
                                    onClick={() => {
                                        setShowGroupSettings(false);
                                        setShowAddMembers(true);
                                    }}
                                    className="w-full btn btn-primary btn-sm"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Members
                                </button>
                                
                                <button
                                    onClick={handleDeleteGroup}
                                    className="w-full btn btn-error btn-sm"
                                >
                                    Delete Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Members Modal */}
            {showAddMembers && (
                <div className="modal modal-open">
                    <div className="w-11/12 max-w-md mx-4 modal-box sm:mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Add Members</h3>
                            <button
                                onClick={() => {
                                    setShowAddMembers(false);
                                    setSelectedUsers([]);
                                }}
                                className="btn btn-sm btn-ghost"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="mb-3 text-sm text-base-content/70">
                                Select users to add to the group:
                            </p>
                            
                            <div className="p-2 space-y-2 overflow-y-auto rounded-lg max-h-60 bg-base-50">
                                {isUsersLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="loading loading-spinner loading-md"></div>
                                        <span className="ml-2 text-sm">Loading users...</span>
                                    </div>
                                ) : getAvailableUsers().length === 0 ? (
                                    <div className="py-8 text-center text-base-content/60">
                                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No users available to add</p>
                                        <p className="mt-1 text-xs">All users are already in this group</p>
                                    </div>
                                ) : (
                                    getAvailableUsers().map((user) => (
                                        <div 
                                            key={user._id} 
                                            className="flex items-center gap-3 p-3 transition-colors border rounded-lg cursor-pointer hover:bg-base-200 border-base-300/50"
                                            onClick={() => handleUserToggle(user._id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => handleUserToggle(user._id)}
                                                className="checkbox checkbox-primary checkbox-sm"
                                            />
                                            <div className="avatar">
                                                <div className="w-8 h-8 rounded-full">
                                                    <img
                                                        src={user.profilePic || "/avatar.png"}
                                                        alt={user.fullName}
                                                        className="object-cover w-full h-full rounded-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.fullName}</p>
                                                <p className="text-xs truncate text-base-content/60">{user.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t modal-action border-base-300">
                            <button
                                onClick={() => {
                                    setShowAddMembers(false);
                                    setSelectedUsers([]);
                                }}
                                className="btn btn-ghost btn-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMembers}
                                disabled={selectedUsers.length === 0}
                                className={`btn btn-primary btn-sm ${selectedUsers.length === 0 ? 'btn-disabled' : ''}`}
                            >
                                {selectedUsers.length === 0 ? (
                                    'Select Users'
                                ) : (
                                    `Add ${selectedUsers.length} Member${selectedUsers.length > 1 ? 's' : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupChatRoom;
