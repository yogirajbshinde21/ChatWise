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
import { Users, Send, Image as ImageIcon, Crown, UserPlus, UserMinus, Settings, X, ArrowLeft, Lightbulb, Info } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

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

    // Set up socket connection and real-time subscriptions
    useEffect(() => {
        if (socket) {
            setSocket(socket);
            
            // Subscribe to group events only once
            const groupStore = useGroupStore.getState();
            groupStore.subscribeToGroupEvents();

            return () => {
                // Clean up on unmount only
                groupStore.unsubscribeFromGroupEvents();
            };
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
                    markMessagesAsSeen(newUnseenMessages);
                }, 2000);
            }
        }

        return () => {
            if (seenTimeoutRef.current) {
                clearTimeout(seenTimeoutRef.current);
            }
        };
    }, [groupMessages, authUser._id, markMessagesAsSeen]);

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
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-base-content/50" />
                    <h3 className="font-semibold text-lg mb-2">Select a Group</h3>
                    <p className="text-base-content/60">
                        Choose a group from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Group Header */}
            <div className="border-b border-base-300 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Back button for mobile */}
                        <button 
                            onClick={() => setSelectedGroup(null)}
                            className="p-1 -ml-1 rounded-full lg:hidden hover:bg-base-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            {isAdmin && (
                                <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                            )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{selectedGroup.name}</h3>
                            <p className="text-xs sm:text-sm text-base-content/70">
                                {selectedGroup.members.length} member{selectedGroup.members.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {isGroupMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : groupMessages.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-base-content/50" />
                        <h3 className="font-semibold text-base sm:text-lg mb-2">No Messages Yet</h3>
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
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                                        <img
                                            src={message.senderId.profilePic || "/avatar.png"}
                                            alt={message.senderId.fullName}
                                            className="object-cover w-full h-full rounded-full"
                                        />
                                    </div>
                                </div>
                                
                                <div className="chat-header">
                                    <span className="text-xs sm:text-sm font-medium">
                                        {message.senderId.fullName}
                                    </span>
                                    <time className="text-xs opacity-50 ml-1">
                                        {formatMessageTime(message.createdAt)}
                                    </time>
                                </div>
                                
                                <div className="chat-bubble max-w-xs sm:max-w-md">
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Shared image"
                                            className="rounded-lg w-full max-w-[200px] sm:max-w-[280px] max-h-[200px] sm:max-h-[300px] object-cover mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(message.image, '_blank')}
                                        />
                                    )}
                                    {message.text && <p className="text-sm sm:text-base">{message.text}</p>}
                                    {message.isChatty && (
                                        <div className="badge badge-primary badge-sm mt-1 gap-1">
                                            <Lightbulb className="w-3 h-3" />
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
                                                                <div key={seenUser.user} className="w-4 h-4 rounded-full border border-base-content/20 overflow-hidden">
                                                                    <img
                                                                        src={member.profilePic || "/avatar.png"}
                                                                        alt={member.fullName}
                                                                        className="w-full h-full object-cover"
                                                                        title={`${member.fullName} - ${new Date(seenUser.seenAt).toLocaleTimeString()}`}
                                                                    />
                                                                </div>
                                                            ) : null;
                                                        })}
                                                        {message.seenBy.length > 3 && (
                                                            <div className="w-4 h-4 rounded-full bg-base-300 border border-base-content/20 flex items-center justify-center">
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
            <div className="border-t border-base-300">
                {/* !Chatty Feature Suggestion */}
                <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-base-200">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                        <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 animate-pulse" />
                        <span>
                            Tip: Use{" "}
                            <span className="font-mono bg-primary/10 px-1.5 py-0.5 rounded text-primary font-semibold border border-primary/20">
                                !Chatty
                            </span>{" "}
                            in your message for AI summaries
                        </span>
                        <div 
                            className="tooltip tooltip-top tooltip-primary" 
                            data-tip="💡 Messages containing '!Chatty' will be included in AI-generated group summaries. Perfect for important announcements, decisions, or key discussions you want to highlight! Example: '!Chatty Don't forget about tomorrow's meeting at 2 PM'"
                        >
                            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-primary/70 hover:text-primary cursor-help transition-colors" />
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4">
                {selectedImage && (
                    <div className="mb-3">
                        <div className="relative inline-block">
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="w-16 h-16 sm:w-20 sm:h-20 max-w-[80px] max-h-[80px] object-cover rounded-lg border border-base-300"
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
                    
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className={`input input-bordered w-full text-sm sm:text-base ${
                                newMessage.toLowerCase().includes('!chatty') 
                                    ? 'border-primary bg-primary/5 placeholder-primary/50' 
                                    : ''
                            }`}
                        />
                        {newMessage.toLowerCase().includes('!chatty') && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="tooltip tooltip-left" data-tip="AI Summary Ready! 🤖">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className="btn btn-primary btn-sm sm:btn-md"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
            </div>

            {/* Member List Modal */}
            {showMemberList && (
                <div className="modal modal-open">
                    <div className="modal-box w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Group Members</h3>
                            <button
                                onClick={() => setShowMemberList(false)}
                                className="btn btn-sm btn-ghost"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
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
                                                <p className="text-xs text-yellow-600 flex items-center gap-1">
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
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <button
                                    onClick={() => {
                                        setShowMemberList(false);
                                        setShowAddMembers(true);
                                    }}
                                    className="btn btn-primary btn-sm w-full"
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
                    <div className="modal-box w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Group Settings</h3>
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
                                    className="btn btn-primary btn-sm w-full"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Members
                                </button>
                                
                                <button
                                    onClick={handleDeleteGroup}
                                    className="btn btn-error btn-sm w-full"
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
                    <div className="modal-box w-11/12 max-w-md mx-4 sm:mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Add Members</h3>
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
                            <p className="text-sm text-base-content/70 mb-3">
                                Select users to add to the group:
                            </p>
                            
                            <div className="max-h-60 overflow-y-auto space-y-2 bg-base-50 rounded-lg p-2">
                                {isUsersLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="loading loading-spinner loading-md"></div>
                                        <span className="ml-2 text-sm">Loading users...</span>
                                    </div>
                                ) : getAvailableUsers().length === 0 ? (
                                    <div className="text-center py-8 text-base-content/60">
                                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No users available to add</p>
                                        <p className="text-xs mt-1">All users are already in this group</p>
                                    </div>
                                ) : (
                                    getAvailableUsers().map((user) => (
                                        <div 
                                            key={user._id} 
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors border border-base-300/50"
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
                                                <p className="font-medium truncate text-sm">{user.fullName}</p>
                                                <p className="text-xs text-base-content/60 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-action pt-4 border-t border-base-300">
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
