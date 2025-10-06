import axios from "axios";

const api = axios.create({
  baseURL: "/api", // all requests start form .api
  timeout: 10000, // 10 s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// attach jwt tokens automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// This replaces the need for try and catch blocks

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error); // keep the error for the caller
  },
);

export default api;
