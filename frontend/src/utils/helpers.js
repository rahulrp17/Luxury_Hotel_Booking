/**
 * Generic helper functions (no React dependency).
 */

export const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const isEmpty = (value) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (isObject(value) && Object.keys(value).length === 0);

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const debounce = (fn, wait = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};

export const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});

/** Build a stable query string from an object, skipping empty values. */
export const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const str = search.toString();
  return str ? `?${str}` : "";
};

export const toErrorText = (error, fallback = "Something went wrong") =>
  error?.message || error?.response?.data?.message || fallback;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const scrollToTop = () => {
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
};

const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 1024, 1280];

/**
 * Build a responsive `srcSet` string for images.unsplash.com URLs so browsers
 * pick the exact width they need (and never download the full-size original).
 * Returns undefined for non-Unsplash or invalid URLs so callers can pass it
 * straight to <img srcSet=...> harmlessly.
 */
export const buildResponsiveSrcSet = (url) => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("images.unsplash.com")) return undefined;
    return RESPONSIVE_WIDTHS.map((w) => {
      parsed.searchParams.set("w", String(w));
      parsed.searchParams.set("q", "75");
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "max");
      return `${parsed.toString()} ${w}w`;
    }).join(", ");
  } catch {
    return undefined;
  }
};
