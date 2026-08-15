import axiosInstance from "./axiosInstance";
import { tokenStore } from "@/utils/storage";
import { API } from "@/constants/api";

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
    throw new Error("Refresh response contained no access token.");
  } catch (error) {
    tokenStore.clearAll();
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
