/* eslint-disable no-console */
/**
 * Global test environment bootstrap.
 *
 * Every API/unit test is expected to run under NODE_ENV=test so rate-limiters
 * pass through (see rateLimiter.js) and so security/validation tests can probe
 * the actual middlewares. We also enforce stable secrets so the JWT + Razorpay
 * HMAC helpers never read production values.
 */
process.env.NODE_ENV = "test";

// Force local/deterministic secrets (tests never touch real credentials).
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test_access_secret_min_32_chars_x";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret_min_32_chars_x";
process.env.JWT_EMAIL_VERIFY_SECRET = process.env.JWT_EMAIL_VERIFY_SECRET || "test_email_verify_secret_32_chars";
process.env.JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || "15m";
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";

// Razorpay — used only when we intentionally do NOT mock it. Set inert values.
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "test_key_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

// Cloudinary updates in a disabled state for tests — uploads are exercised via
// the storage/validation layer, not real cloud calls.
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "test";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "test";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "test";

// Prevent the Morper/upload configs from trying a real network connection.
// Rate-limit uses the in-memory store unless RATE_LIMIT_USE_REDIS=true.
process.env.RATE_LIMIT_USE_REDIS = "false";

// Email verification is MANDATORY for all logins (see auth.service.js). The
// user factory defaults to isEmailVerified: true, so a fresh user can log in
// without an SMTP round trip. Explicitly verifying the env var is unused now —
// kept as documentation only.

// The global Limiter skips when NODE_ENV=test (see rateLimiter.js). We keep a
// dedicated limiter check in security test that instantiates its own instance.

// Replace the real `ioredis` client with an in-memory implementation for every
// test. `config/redis.js` lazily creates a real client on first command — without
// this mock it would retry-connect to localhost:6379, slow every cache read, and
// leak open handles. ioredis-mock mirrors the subset we use (get/setex/del/keys).
jest.mock("ioredis", () => {
  const RedisMock = require("ioredis-mock");
  return RedisMock.default || RedisMock;
});

// Email uses a nodemailer transport that would attempt a real SMTP connection
// (and hang) on register / booking / payment events. Stub the whole service so
// those flows complete instantly; the sent-email side-effect is out of scope for
// the API suite. sms.service self-mocks (no SMS_API_KEY) and never throws.
jest.mock("../src/modules/notifications/email.service", () => {
  const mk = () => jest.fn().mockResolvedValue({ messageId: "mocked" });
  return {
    sendEmail: mk(),
    sendWelcomeEmail: mk(),
    sendPasswordResetEmail: mk(),
    sendBookingConfirmation: mk(),
    sendBookingCancellation: mk(),
    sendRefundEmail: mk(),
    sendOfferEmail: mk(),
    escapeHtml: (v) => String(v ?? ""),
  };
});