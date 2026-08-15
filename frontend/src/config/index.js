/**
 * Centralised access to environment configuration (Vite injects VITE_* vars).
 * Keys are mirrored in .env.example.
 */

const env = {
  apiUrl: import.meta.env.VITE_API_URL || "/api/v1",
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
  siteUrl: import.meta.env.VITE_SITE_URL || import.meta.env.VITE_FRONTEND_URL || "",
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

/** Shallow-freeze so consumers can't accidentally mutate config. */
export default Object.freeze({ ...env });