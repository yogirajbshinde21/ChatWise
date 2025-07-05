import {create} from "zustand";
import { axiosInstannce } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
    authUser:null,   //'null' because we don't know whether User is authenticated or not intitially.
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,   // Initially, this is 'true' because as user comes on page, it will check the authentication.

    checkAuth: async() => {
        try{
            const res = await axiosInstannce.get("/api/check");
            
            set({authUser:res.data});
        
        } catch (error) {
            console.log("Error in checkAuth", error);
            set({authUser:null});
        } finally {
            set({ isCheckingAuth: false });
        }
    }


})

);