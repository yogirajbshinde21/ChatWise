import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:5001/api" 
        : "https://backend-chatwise.onrender.com/api", // Point to your backend service
    withCredentials: true,
});