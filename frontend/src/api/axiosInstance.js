import axios from "axios";
import config from "@/config";

/**
 * Shared axios instance. All API requests flow through this so auth headers,
 * credentials, and base URL stay consistent. `withCredentials` sends the
 * refresh token HttpOnly cookie set by the backend.
 */
const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
