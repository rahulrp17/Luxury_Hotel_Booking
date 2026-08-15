import { useCallback, useSyncExternalStore } from "react";

/** localStorage-backed wishlist of hotel/room snaps. */
const STORAGE_KEY = "aurelia:wishlist:v1";

const read = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const listeners = new Set();

// Cached snapshot. getSnapshot MUST return the same reference until the store
// actually changes, otherwise useSyncExternalStore re-renders forever
// ("Maximum update depth exceeded" / "getSnapshot should be cached"). The
// cache is the source of truth; localStorage is the persistence mirror.
let cachedSnapshot = read();

const emit = () => listeners.forEach((listener) => listener());

export const writeWishlist = (items) => {
  cachedSnapshot = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full / unavailable — keep in-memory */
  }
  emit();
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => cachedSnapshot;

/** Cross-tab sync keeps two luxury tabs truthful. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      cachedSnapshot = read();
      emit();
    }
  });
}

/**
 * Wishlist hook: items = [{ _id, name, images[0].url, address.city, pricing }].
 */
export const useWishlist = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot);
  const has = useCallback(
    (id) => items.some((item) => item._id === id),
    [items]
  );
  const toggle = useCallback((item) => {
    const current = getSnapshot();
    const exists = current.some((existing) => existing._id === item._id);
    writeWishlist(
      exists
        ? current.filter((existing) => existing._id !== item._id)
        : [...current, item]
    );
  }, []);
  const remove = useCallback(
    (id) => writeWishlist(getSnapshot().filter((item) => item._id !== id)),
    []
  );
  const clear = useCallback(() => writeWishlist([]), []);

  return { items, has, toggle, remove, clear, count: items.length };
};

export default useWishlist;