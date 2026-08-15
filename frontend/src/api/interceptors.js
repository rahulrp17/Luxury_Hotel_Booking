import axiosInstance from "./axiosInstance";
import { tokenStore } from "@/utils/storage";
import { refreshAccessToken, isSessionError } from "./refresh";

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh-token"];

const isAuthEndpoint = (url) =>
  AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

/**
 * Auth request interceptor: attaches the access token to every request, except
 * the auth endpoints themselves (login/register/refresh) which are sent without
 * a possibly-expired Bearer header.
 */
axiosInstance.interceptors.request.use(
  (request) => {
    if (!isAuthEndpoint(request.url || "")) {
      const token = tokenStore.getAccessToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    }
    return request;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/**
 * Response interceptor: on 401, attempt a single refresh then replay the
 * original request once. If refresh fails with a session rejection (401/403),
 * clears auth and notifies the app; transient errors keep the session intact.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    if (isAuthEndpoint(url)) {
      tokenStore.clearAll();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (isSessionError(refreshError) && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
