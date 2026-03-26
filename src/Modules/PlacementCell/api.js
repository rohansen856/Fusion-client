import axios from "axios";

// Axios instance calling G1 Services
const api = axios.create();

// Intercept requests to automatically inject the auth token if available,
// though components can also provide it manually.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Only set Authorization header if it hasn't been explicitly set
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
