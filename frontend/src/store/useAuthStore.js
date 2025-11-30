import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
// import axios from "axios";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";  // Importing useChatStore to access its methods in updateProfile socket.io


const BASE_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:5001" 
    : "https://backend-chatwise.onrender.com"; // Point to your backend service


export const useAuthStore = create((set, get) => ({
    authUser:null,   //'null' because we don't know whether User is authenticated or not intitially.
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,   // Initially, this is 'true' because as user comes on page, it will check the authentication.
    onlineUsers: [],
    socket: null,

    checkAuth: async() => {
        try{
            const res = await axiosInstance.get("/auth/check");
            
            set({authUser:res.data});
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth", error);
            set({authUser:null});
        } finally {
            set({ isCheckingAuth: false });
        }
    },


    signup: async (data) => {
        
        set({ isSigningUp: true});
        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            
            // Store token in localStorage as backup for cookie issues
            if (res.data.token) {
                localStorage.setItem('auth-token', res.data.token);
            }
            
            toast.success("Account created successfully.");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create account");
            
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
        await axiosInstance.post("/auth/logout");
        set({ authUser: null });
        
        // Clear token from localStorage
        localStorage.removeItem('auth-token');
        
        toast.success("Logged out successfully.");
        get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");

        }

    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            
            // Store token in localStorage as backup for cookie issues
            if (res.data.token) {
                localStorage.setItem('auth-token', res.data.token);
            }
            
            toast.success("Logged in successfully.");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });  //Show loading spinner in UI
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);  // Update user info on the server
            set({ authUser: res.data });  // Update UI with new data
            toast.success("Profile updated successfully.");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally {
            set({ isUpdatingProfile: false });  //  End loading state

        }
    },



    connectSocket: () => {
        const { authUser } = get();
        if(!authUser || get().socket?.connected) return;

          const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
        socket.connect()

        set({ socket: socket});

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        socket.on("profileUpdated", (data) => {
            const chatStore = useChatStore.getState();
            chatStore.updateUserProfile(data.userId, data.profilePic);

            // Update selected user if it matches 
            if (chatStore.selectedUser?._id === data.userId) {
                chatStore.setSelectedUser({
                    ...chatStore.selectedUser,
                    profilePic: data.profilePic
                });
            }
        });

        // Set socket in group store and subscribe to group events immediately
        console.log("🔄 AuthStore: Setting up group socket events globally");
        try {
            // Use dynamic import to avoid circular dependency
            import("./useGroupStore.js").then(({ useGroupStore }) => {
                const { setSocket, subscribeToGroupEvents } = useGroupStore.getState();
                setSocket(socket);
                subscribeToGroupEvents();
            });
        } catch (error) {
            console.log("⚠️ Could not set up group socket events:", error);
        }
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.off("profileUpdated");
            get().socket.disconnect();
        }
    }
})

);