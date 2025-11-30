import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


// Fetches the list of users you can chat with.
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // Loads messages with a specific user.
    getMessages: async (userId) => {
        set({ isMessagesLoading: true});
        try{
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // Sends a new message to the selected user.
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();

        try{
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, res.data]});
        
        
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    // Subscribe to real-time messages
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
    },

    updateUserProfile: (userId, profilePic) => {
        set({
            users: get().users.map(user => 
                user._id === userId 
                ? { ...user, profilePic }
            : user
        )
        });
    },

// Optimize this one later
  setSelectedUser: (selectedUser) => {
    console.log(`🎯 ChatStore: Setting selected user to:`, selectedUser?.fullName || 'null');
    
    // Clear any selected group when selecting a user to avoid conflicts
    if (selectedUser) {
        console.log("🧹 ChatStore: Clearing selected group due to user selection");
        import('./useGroupStore').then(({ useGroupStore }) => {
            useGroupStore.getState().setSelectedGroup(null);
        });
    }
    set({ selectedUser });
  },


}));