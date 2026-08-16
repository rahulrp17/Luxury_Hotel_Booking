const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");
const { getRedisClient } = require("../config/redis");

// Redis-backed store, opt-in via RATE_LIMIT_USE_REDIS=true. Falls back to the
// in-memory store (express-rate-limit default) when disabled or unavailable.
let sharedRedisStore = null;
if (process.env.RATE_LIMIT_USE_REDIS === "true") {
  try {
    const { RedisStore } = require("rate-limit-redis");
    const client = getRedisClient();
    sharedRedisStore = new RedisStore({
      sendCommand: (...args) => client.call(...args),
      prefix: "rl:",
    });
  } catch (err) {
    logger.warn(`Redis rate-limit store unavailable; falling back to in-memory: ${err.message}`);
    sharedRedisStore = null;
  }
}
const storeOpt = sharedRedisStore ? { store: sharedRedisStore } : {};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    timestamp: new Date().toISOString(),
  });
};

// ─── Global Limiter ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

// ─── Auth Limiter (strict) ────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts. Please wait 15 minutes.",
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

// ─── Payment Limiter (very strict) ───────────────────────────────────────
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

// ─── Booking Limiter ─────────────────────────────────────────────────────
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

// ─── AI Concierge Limiter ────────────────────────────────────────────────
// Public endpoint that triggers database queries and (optionally) an OpenRouter
// call per message — bound so a single IP can't burn the model budget or hammer
// the DB. Configurable via env, defaults to 20 messages / minute.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

// ─── Upload Limiter ──────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

// ─── Webhook Limiter (payment gateway callbacks) ─────────────────────────
// Higher allowance than normal endpoints: Razorpay may deliver bursts of
// webhook events, but still bound abuse from forged/unauthed requests.
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  ...storeOpt,
  skip: () => process.env.NODE_ENV === "test",
});

module.exports = {
  globalLimiter,
  authLimiter,
  paymentLimiter,
  bookingLimiter,
  uploadLimiter,
  webhookLimiter,
  aiLimiter,
};
