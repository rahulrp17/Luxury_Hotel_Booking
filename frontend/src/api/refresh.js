import axiosInstance from "./axiosInstance";
import { tokenStore } from "@/utils/storage";
import { API } from "@/constants/api";

/**
 * True when the backend explicitly rejected the session (invalid/expired
 * refresh token). Transient errors (network blips, 5xx) must NOT log the user
 * out or wipe stored tokens.
 */
export const isSessionError = (error) => {
  if (error?.isSessionError) return true;
  const status = error?.response?.status;
  return status === 401 || status === 403;
};

/**
 * Single-flight access-token refresh. Concurrent 401s share one in-flight
 * refresh instead of triggering a storm of refresh calls.
 */
let refreshPromise = null;

const performRefresh = async () => {
  try {
    const { data } = await axiosInstance.post(API.AUTH.REFRESH_TOKEN);
    const accessToken = data?.data?.accessToken;
    if (accessToken) {
      tokenStore.setAccessToken(accessToken);
      return accessToken;
    }
    const error = new Error("Refresh response contained no access token.");
    error.isSessionError = true;
    throw error;
  } catch (error) {
    if (isSessionError(error)) {
      tokenStore.clearAll();
    }
    throw error;
  }
};

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const clearAuth = () => tokenStore.clearAll();
