// api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Change to your local backend URL
  timeout: 30000,
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
    console.log(`📡 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.status, error.response?.data);
    
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