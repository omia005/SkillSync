import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

console.log("BASE URL:", import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    
  },
  (error) => {
    return Promise.reject(error);
  }
)

export default api;