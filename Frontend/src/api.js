import axios from "axios";
import { ACCESS_TOKEN } from "./constants";
import { jwtDecode } from "jwt-decode";

console.log("BASE URL:", import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
})

api.interceptors.request.use(
  async (config) => {
    const token = sessionStorage.getItem(ACCESS_TOKEN);
    if (token) {
      // Check if token is about to expire (within 1 minute)
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        const bufferTime = 60; // 1 minute buffer
        
        if (decoded.exp && decoded.exp - now < bufferTime) {
          // Proactively refresh before expiration
          try {
            const res = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/users/token/refresh/`,
              {},
              { withCredentials: true }
            );
            const newToken = res.data.access;
            sessionStorage.setItem(ACCESS_TOKEN, newToken);
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (refreshErr) {
            console.error("Proactive token refresh failed:", refreshErr);
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (decodeErr) {
        console.error("Token decode error:", decodeErr);
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
    
  },
  (error) => {
    return Promise.reject(error);
  }
)

export default api;