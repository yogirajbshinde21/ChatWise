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

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],
    isGroupsLoading: false,
    isGroupMessagesLoading: false,
    groupSummary: null,
    isGeneratingSummary: false,
    socket: null,

    // Get all user's groups
    getUserGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups");
            set({ groups: res.data.groups });
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error(error.response?.data?.message || "Failed to fetch groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    // Create a new group
    createGroup: async (groupData) => {
        try {
            const res = await axiosInstance.post("/groups", groupData);
            set((state) => ({
                groups: [res.data.group, ...state.groups],
            }));
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
        set({ selectedGroup: group, groupMessages: [] });
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
    getGroupSummary: async (groupId, mode = "previousDay") => {
        set({ isGeneratingSummary: true, groupSummary: null });
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/summary?mode=${mode}`);
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
    markMessagesAsSeen: async (messageIds) => {
        try {
            await axiosInstance.post("/groups/messages/seen", { messageIds });
        } catch (error) {
            console.error("Error marking messages as seen:", error);
            // Don't show toast for this as it's a background operation
        }
    },

    // Real-time event handlers
    subscribeToGroupEvents: () => {
        const socket = get().socket;
        if (!socket) {
            console.log("⚠️ No socket available for group events subscription");
            return;
        }

        console.log("🔄 Subscribing to group events...");

        // Clean up any existing listeners first to prevent duplicates
        socket.off("newGroup");
        socket.off("groupUpdated");
        socket.off("groupDeleted");
        socket.off("removedFromGroup");
        socket.off("newGroupMessage");
        socket.off("messageSeenUpdate");

        // Listen for new group creation
        socket.on("newGroup", (group) => {
            console.log("📢 New group received:", group.name);
            set((state) => ({
                groups: [group, ...state.groups],
            }));
            toast.success(`You've been added to group: ${group.name}`);
            
            // Refresh the groups list to ensure we have the latest data
            setTimeout(() => {
                get().getUserGroups();
            }, 1000);
        });

        // Listen for group updates
        socket.on("groupUpdated", (updatedGroup) => {
            console.log("📢 Group updated:", updatedGroup.name);
            set((state) => ({
                groups: state.groups.map(group => 
                    group._id === updatedGroup._id ? updatedGroup : group
                ),
                selectedGroup: state.selectedGroup?._id === updatedGroup._id ? updatedGroup : state.selectedGroup
            }));
        });

        // Listen for group deletion
        socket.on("groupDeleted", ({ groupId, groupName }) => {
            console.log("📢 Group deleted:", groupName);
            set((state) => ({
                groups: state.groups.filter(group => group._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
                groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages
            }));
            toast.error(`Group "${groupName}" has been deleted`);
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
    },

    unsubscribeFromGroupEvents: () => {
        const socket = get().socket;
        if (!socket) {
            console.log("⚠️ No socket available for group events unsubscription");
            return;
        }

        console.log("🔄 Unsubscribing from group events...");
        socket.off("newGroup");
        socket.off("groupUpdated");
        socket.off("groupDeleted");
        socket.off("removedFromGroup");
        socket.off("newGroupMessage");
        socket.off("messageSeenUpdate");
    },

    // Set socket instance
    setSocket: (socket) => {
        set({ socket });
    },
}));
