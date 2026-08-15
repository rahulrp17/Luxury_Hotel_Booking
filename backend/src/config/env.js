const logger = require("./logger");

/**
 * Environment variables required for the app to function. Missing any of these
 * in production aborts startup (fail fast) rather than failing at runtime mid-
 * request. In development/test they are only logged as warnings so local work
 * is not blocked.
 */
const REQUIRED = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_EMAIL_VERIFY_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

/**
 * Optional vars that degrade a feature if missing. Warned about in production.
 */
const OPTIONAL_WARN = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "REDIS_URL",
  "SMS_API_KEY",
  "FRONTEND_URL",
];

const validateEnv = () => {
  const isProd = process.env.NODE_ENV === "production";

  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;
    if (isProd) {
      throw new Error(message);
    }
    logger.warn(message);
  }

  if (isProd) {
    const unsetOptional = OPTIONAL_WARN.filter((k) => !process.env[k]);
    if (unsetOptional.length > 0) {
      logger.warn(`Unset optional env vars (related features may be degraded): ${unsetOptional.join(", ")}`);
    }
  }
};

module.exports = { validateEnv };
