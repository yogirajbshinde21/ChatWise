import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:5001/api" 
        : "https://backend-chatwise.onrender.com/api", // Point to your backend service
    withCredentials: true,
});

// Add request interceptor to include token from localStorage as backup
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);