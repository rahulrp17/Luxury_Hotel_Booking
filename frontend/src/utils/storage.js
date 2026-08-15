/**
 * Safe localStorage wrapper (guards against SSR, unavailable storage, and
 * malformed JSON). The backend also sets the refresh token in an HttpOnly
 * cookie; only the access token + a small user cache are stored client-side.
 */

const ACCESS_TOKEN_KEY = "lux_hb_access_token";
const USER_KEY = "lux_hb_user";

const isAvailable = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const storage = {
  get(key) {
    if (!isAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    if (!isAvailable()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / private mode — ignore */
    }
  },
  remove(key) {
    if (!isAvailable()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const tokenStore = {
  getAccessToken: () => storage.get(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => storage.set(ACCESS_TOKEN_KEY, token),
  clearAccessToken: () => storage.remove(ACCESS_TOKEN_KEY),
  getCachedUser: () => storage.get(USER_KEY),
  cacheUser: (user) => storage.set(USER_KEY, user),
  clearUser: () => storage.remove(USER_KEY),
  clearAll: () => {
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(USER_KEY);
  },
};

export default storage;
