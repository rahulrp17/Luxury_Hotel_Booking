/**
 * API barrel. Importing this module registers the axios interceptors (side
 * effect) and exposes the shared instance + helpers used by every service.
 */
import "./interceptors";

export { default as axiosInstance } from "./axiosInstance";
export { refreshAccessToken, clearAuth } from "./refresh";
export { extractErrorMessage, toErrorMessage } from "./errorHandler";
