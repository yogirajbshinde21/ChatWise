import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import axios from "axios";
export const useAuthStore = create((set) => ({
    authUser:null,   //'null' because we don't know whether User is authenticated or not intitially.
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,   // Initially, this is 'true' because as user comes on page, it will check the authentication.

    checkAuth: async() => {
        try{
            const res = await axiosInstance.get("/auth/check");
            
            set({authUser:res.data});
        
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
            toast.success("Account created successfully.");

        } catch (error) {
            toast.error(error.response.data.message);
            
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
        await axiosInstance.post("/auth/logout");
        set({ authUser: null });
        toast.success("Logged out successfully.");

        } catch (error) {
            toast.error(error.response.data.message);

        }

    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully.");
        } catch (error) {
            toast.error(error.response.data.message);
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
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });  //  End loading state

        }
    }
})

);