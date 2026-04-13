// api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://pbl-project-w4f9.onrender.com/api",
  timeout: 30000, // Increased from 10000 to 30000 milliseconds (30 seconds)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to automatically add token to all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
