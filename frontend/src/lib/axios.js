import axios from "axios";

export const axiosInstannce = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,   // send cookies in every single request
}); 