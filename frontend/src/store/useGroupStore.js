/**
 * GROUP STORE - Zustand store for group chat state management
 * 
 * This store manages:
 * - List of user's groups
 * - Currently selected group
 * - Group messages
 * - Group summary data
 * - Real-time updates for group events
 * 
 * Key Features:
 * - Centralized group state management
 * - Real-time message updates
 * - Group member management
 * - AI summary integration
 * - Last seen tracking
 */

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],
    isGroupsLoading: false,
    isGroupMessagesLoading: false,
    groupSummary: null,
    isGeneratingSummary: false,
    socket: null,
    lastSummaryUpdate: 0,

    // Get all user's groups
    getUserGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups");
            console.log("📊 Fetched", res.data.groups.length, "groups from server");
            set({ groups: res.data.groups });
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error(error.response?.data?.message || "Failed to fetch groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    // Force refresh groups list (useful for debugging)
    refreshGroups: async () => {
        console.log("🔄 Force refreshing groups list...");
        await get().getUserGroups();
    },

    // Create a new group
    createGroup: async (groupData) => {
        try {
            console.log("🔨 Creating group via API...");
            const res = await axiosInstance.post("/groups", groupData);
            
            console.log("✅ Group created via API, adding to state...");
            set((state) => {
                console.log("📊 Groups count before adding:", state.groups.length);
                const newGroups = [res.data.group, ...state.groups];
                console.log("📊 Groups count after adding:", newGroups.length);
                return {
                    groups: newGroups,
                };
            });
            
            console.log("✅ Group added to state successfully");
            toast.success("Group created successfully!");
            return res.data.group;
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error(error.response?.data?.message || "Failed to create group");
            throw error;
        }
    },

    // Select a group for chatting
    setSelectedGroup: (group) => {
        console.log(`🎯 GroupStore: Setting selected group to:`, group?.name || 'null');
        
        // Clear any selected user when selecting a group to avoid conflicts
        if (group) {
            console.log("🧹 GroupStore: Clearing selected user due to group selection");
            // We'll import dynamically to avoid circular dependency
            import('./useChatStore').then(({ useChatStore }) => {
                useChatStore.getState().setSelectedUser(null);
            });
        }
        
        set({ selectedGroup: group, groupMessages: group ? [] : [] });
    },

    // Get messages for a specific group
    getGroupMessages: async (groupId) => {
        set({ isGroupMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/messages`);
            set({ groupMessages: res.data });
        } catch (error) {
            console.error("Error fetching group messages:", error);
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isGroupMessagesLoading: false });
        }
    },

    // Send a message to a group
    sendGroupMessage: async (groupId, messageData) => {
        try {
            const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
            
            // For the sender, we rely on the real-time socket update to avoid duplicate messages
            // The socket will emit the message back to all users including the sender
            console.log("✅ Message sent successfully, waiting for socket update");
            
            return res.data;
        } catch (error) {
            console.error("Error sending group message:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
            throw error;
        }
    },

    // Add members to a group
    addGroupMembers: async (groupId, memberIds) => {
        try {
            const res = await axiosInstance.post(`/groups/${groupId}/members`, { memberIds });
            
            // Update the group in the groups list
            set((state) => ({
                groups: state.groups.map(group => 
                    group._id === groupId ? res.data.group : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId ? res.data.group : state.selectedGroup
            }));
            
            toast.success("Members added successfully!");
            return res.data.group;
        } catch (error) {
            console.error("Error adding group members:", error);
            toast.error(error.response?.data?.message || "Failed to add members");
            throw error;
        }
    },

    // Remove a member from a group
    removeGroupMember: async (groupId, memberId) => {
        try {
            const res = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
            
            // Update the group in the groups list
            set((state) => ({
                groups: state.groups.map(group => 
                    group._id === groupId ? res.data.group : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId ? res.data.group : state.selectedGroup
            }));
            
            toast.success("Member removed successfully!");
            return res.data.group;
        } catch (error) {
            console.error("Error removing group member:", error);
            toast.error(error.response?.data?.message || "Failed to remove member");
            throw error;
        }
    },

    // Delete a group
    deleteGroup: async (groupId) => {
        try {
            await axiosInstance.delete(`/groups/${groupId}`);
            
            // Remove group from the list
            set((state) => ({
                groups: state.groups.filter(group => group._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
                groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages
            }));
            
            toast.success("Group deleted successfully!");
        } catch (error) {
            console.error("Error deleting group:", error);
            toast.error(error.response?.data?.message || "Failed to delete group");
            throw error;
        }
    },

    // Get group summary
    getGroupSummary: async (groupId) => {
        set({ isGeneratingSummary: true, groupSummary: null });
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/summary`);
            set({ groupSummary: res.data });
            return res.data;
        } catch (error) {
            console.error("Error getting group summary:", error);
            toast.error(error.response?.data?.message || "Failed to generate summary");
            throw error;
        } finally {
            set({ isGeneratingSummary: false });
        }
    },

    // Update last seen for a group
    updateGroupLastSeen: async (groupId) => {
        try {
            await axiosInstance.put(`/groups/${groupId}/last-seen`);
        } catch (error) {
            console.error("Error updating last seen:", error);
            // Don't show toast for this as it's a background operation
        }
    },

    // Mark messages as seen
    markMessagesAsSeen: async (groupId, messageIds) => {
        try {
            await axiosInstance.post("/groups/messages/seen", { groupId, messageIds });
        } catch (error) {
            console.error("Error marking messages as seen:", error);
            // Don't show toast for this as it's a background operation
        }
    },

    // Real-time event handlers
    subscribeToGroupEvents: () => {
        const socket = get().socket;
        if (!socket) return;

        console.log("🔄 Subscribing to group events...");

        // Clean up any existing listeners first
        socket.off("newGroup");
        socket.off("groupUpdated");
        socket.off("groupDeleted");
        socket.off("removedFromGroup");
        socket.off("newGroupMessage");
        socket.off("messageSeenUpdate");
        socket.off("groupSummaryUpdate");

        // Listen for new group creation (only for users who were ADDED to group, not creator)
        socket.on("newGroup", (group) => {
            console.log("📢 newGroup event received:", group.name, "with", group.members.length, "members");
            console.log("📊 Current groups count before processing:", get().groups.length);
            
            // Get current user ID from auth store to be more reliable
            const { authUser } = useAuthStore.getState();
            const currentUserId = authUser?._id;
            console.log("🔍 Current user:", currentUserId, "Group admin:", group.admin._id);
            
            // Only add the group if current user is NOT the admin (creator)
            // The creator already has the group added via the createGroup API response
            if (group.admin._id !== currentUserId) {
                console.log("✅ User was added to group by admin, adding to list");
                
                set((state) => {
                    // Check if group already exists to prevent duplicates
                    const groupExists = state.groups.some(g => g._id === group._id);
                    if (groupExists) {
                        console.log("⚠️ Group already exists, updating instead");
                        return {
                            groups: state.groups.map(g => g._id === group._id ? group : g)
                        };
                    } else {
                        console.log("✅ Adding new group to list");
                        const newGroups = [group, ...state.groups];
                        console.log("📊 New groups count:", newGroups.length);
                        return {
                            groups: newGroups
                        };
                    }
                });
                
                // Show success notification for being added to a group
                toast.success(`You've been added to group: ${group.name}`);
            } else {
                console.log("ℹ️ User is the admin/creator, group already added via API response - IGNORING to prevent duplicate");
            }
            
            // Log final state
            setTimeout(() => {
                console.log("📊 Final groups count after newGroup event:", get().groups.length);
            }, 100);
        });

        // Listen for group updates (includes when admin creates group with initial members)
        socket.on("groupUpdated", (updatedGroup) => {
            console.log("📢 groupUpdated event received:", updatedGroup.name, "with", updatedGroup.members.length, "members");
            
            const { authUser } = useAuthStore.getState();
            const currentUserId = authUser?._id;
            console.log("🔍 Current user:", currentUserId, "Group admin:", updatedGroup.admin._id);
            
            set((state) => {
                const wasInGroup = state.groups.some(g => g._id === updatedGroup._id);
                console.log("🔍 Was user already in group:", wasInGroup);
                
                if (wasInGroup) {
                    // Update existing group
                    console.log("🔄 Updating existing group in list");
                    return {
                        groups: state.groups.map(group => 
                            group._id === updatedGroup._id ? updatedGroup : group
                        ),
                        selectedGroup: state.selectedGroup?._id === updatedGroup._id ? updatedGroup : state.selectedGroup
                    };
                } else {
                    // Group doesn't exist in current user's list
                    // Only add if user is NOT the admin/creator (admin already has it from API response)
                    if (updatedGroup.admin._id === currentUserId) {
                        console.log("ℹ️ Admin received groupUpdated for group creation, but admin already has group from API - IGNORING to prevent duplicate");
                        return state; // No changes for admin
                    } else {
                        // Non-admin user was added to existing group
                        console.log("✅ Adding updated group to list (user was added to existing group)");
                        return {
                            groups: [updatedGroup, ...state.groups]
                        };
                    }
                }
            });
            
            // Show notification for group updates (but not for the admin during group creation)
            if (currentUserId !== updatedGroup.admin._id) {
                toast.success(`Group "${updatedGroup.name}" has been updated`);
            } else {
                console.log("ℹ️ Skipping notification for admin who initiated the action");
            }
        });

        // Listen for group deletion
        socket.on("groupDeleted", ({ groupId, groupName, deletedBy }) => {
            console.log("📢 Group deleted:", groupName, "by user:", deletedBy);
            
            const { authUser } = useAuthStore.getState();
            const currentUserId = authUser?._id;
            console.log("🔍 Current user:", currentUserId, "Deleted by:", deletedBy);
            
            // Only update state if the current user is NOT the one who deleted the group
            // The admin who deleted it already updated their state via the API call
            if (deletedBy !== currentUserId) {
                console.log("✅ Updating state for non-admin user");
                set((state) => ({
                    groups: state.groups.filter(group => group._id !== groupId),
                    selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
                    groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages
                }));
                
                // Show notification only for other members, not the admin who deleted it
                toast.error(`Group "${groupName}" has been deleted`);
            } else {
                console.log("ℹ️ Admin deleted the group, state already updated via API - skipping socket update and toast");
            }
        });

        // Listen for being removed from group
        socket.on("removedFromGroup", ({ groupId, groupName }) => {
            console.log("📢 Removed from group:", groupName);
            set((state) => ({
                groups: state.groups.filter(group => group._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
                groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages
            }));
            toast.error(`You've been removed from group: ${groupName}`);
        });

        // Listen for new group messages - FIXED FOR REAL-TIME UPDATES
        socket.on("newGroupMessage", (message) => {
            // Measure WebSocket delivery latency
            if (message._serverEmitTs) {
                const latencyMs = Date.now() - message._serverEmitTs;
                console.log(`⚡ Group WebSocket delivery latency: ${latencyMs}ms (msgId: ${message._id})`);
            }

            console.log("📢 New group message received:", {
                messageId: message._id,
                groupId: message.groupId,
                text: message.text?.substring(0, 50) + "...",
                sender: message.senderId?.fullName
            });
            
            // Get current state
            const currentState = get();
            const { selectedGroup, groupMessages } = currentState;
            
            // Always update if it's for the currently selected group
            if (selectedGroup?._id === message.groupId) {
                console.log("✅ Adding message to current group");
                
                // Avoid duplicates by checking if message already exists
                const messageExists = groupMessages.some(msg => msg._id === message._id);
                if (!messageExists) {
                    // Use functional update to ensure we get the latest state
                    set((state) => {
                        console.log("🔄 Current messages count:", state.groupMessages.length);
                        const updatedMessages = [...state.groupMessages, message];
                        console.log("🔄 Updated messages count:", updatedMessages.length);
                        return {
                            groupMessages: updatedMessages
                        };
                    });
                    console.log("✅ Message added successfully");
                } else {
                    console.log("⚠️ Message already exists, skipping");
                }
            } else {
                console.log("ℹ️ Message not for current group, skipping");
            }
        });

        // Listen for message seen updates
        socket.on("messageSeenUpdate", ({ messageId, seenBy }) => {
            console.log("📢 Message seen update:", messageId, seenBy.length, "users");
            
            set((state) => ({
                groupMessages: state.groupMessages.map(msg => 
                    msg._id === messageId ? { ...msg, seenBy } : msg
                )
            }));
        });

        // Listen for group summary updates (when message visibility changes)
        socket.on("groupSummaryUpdate", ({ groupId, action, newSeenCount }) => {
            console.log("📢 Group summary update received:", { groupId, action, newSeenCount });
            
            // Trigger a refresh of the current group's summary if it matches
            const { selectedGroup } = get();
            if (selectedGroup?._id === groupId) {
                console.log("✅ Refreshing summary for current group due to visibility update");
                // The summary will be automatically refreshed when the group view is re-rendered
                // due to the groupSummary being fetched based on current state
                
                // Force a small state update to trigger re-render of summary components
                set((state) => ({
                    ...state,
                    lastSummaryUpdate: Date.now()
                }));
            }
        });
    },

    unsubscribeFromGroupEvents: () => {
        const socket = get().socket;
        if (!socket) return;

        socket.off("newGroup");
        socket.off("groupUpdated");
        socket.off("groupDeleted");
        socket.off("removedFromGroup");
        socket.off("newGroupMessage");
        socket.off("messageSeenUpdate");
        socket.off("groupSummaryUpdate");
    },

    // Set socket instance
    setSocket: (socket) => {
        set({ socket });
        
        // Make refresh function available globally for debugging
        if (typeof window !== 'undefined') {
            window.refreshGroups = get().refreshGroups;
            window.groupStore = get();
        }
    },
}));
