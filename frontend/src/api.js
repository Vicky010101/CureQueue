import axios from "axios";
import { roleBasedStorage } from "./utils/roleBasedStorage";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api",
});

// Add token to every request if logged in
API.interceptors.request.use((req) => {
  const token = roleBasedStorage.getToken();
  if (token) {
    req.headers["x-auth-token"] = token;
  }
  return req;
});

// Handle authentication errors intelligently
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Only log out if core auth routes fail
    const isCriticalAuthEndpoint =
      url.includes("/auth/me") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register");

    if ((status === 401 || status === 403) && isCriticalAuthEndpoint) {
      console.log(`[API] Auth error on ${url}, clearing storage and redirecting`);
      roleBasedStorage.clearAll();
      window.location.href = "/login";
      return;
    }

    return Promise.reject(error);
  }
);

export default API;
