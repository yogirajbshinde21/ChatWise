import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api": "/api",  // Use the base URL for development or production
    withCredentials: true,   // send cookies in every single request
}); 