const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const morgan = require("morgan");

const logger = require("./config/logger");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const { globalLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes");

const app = express();

// ─── Trust Proxy ────────────────────────────────────────────────────────────
// Requests reach this server behind a reverse proxy — ngrok in local dev, and
// typically a load balancer / CDN in production. Express must be told to trust
// the proxy-forwarded headers (X-Forwarded-For / X-Forwarded-Proto) BEFORE the
// rate limiters run, otherwise:
//   - express-rate-limit (v7+) throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
//     ("X-Forwarded-For is set but the 'trust proxy' setting is false"), and
//   - req.ip resolves to the proxy's local address, so every request is keyed
//     to the ngrok tunnel instead of the real client IP.
// `trust proxy: N` means "trust the first N hops". N=1 trusts the single proxy
// that sits between the internet and this server. Environment-aware: raise it
// (TRUST_PROXY_HOPS) only if production sits behind more than one trusted hop.
app.set("trust proxy", parseInt(process.env.TRUST_PROXY_HOPS, 10) || 1);

// ─── Security Middlewares ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["https://api.razorpay.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),
      },
    },
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ─── Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ─── Body Parsers ──────────────────────────────────────────────────────────
// Payment webhooks must receive the RAW request body so the HMAC signature
// (which Razorpay computes over the exact bytes) can be verified. This parser
// runs before express.json() and marks the body as parsed, so JSON parsing is
// skipped for this path. Body remains a Buffer for signature hashing.
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Data Sanitization ─────────────────────────────────────────────────────
// Against NoSQL injection / XSS. IMPORTANT: skip the RAW webhook body — the
// payment webhook mounts `express.raw()` earlier and its `req.body` is a Buffer
// that HMAC verification hashes byte-for-byte. Sanitizing it would coerce the
// Buffer into a plain Object and make every signature verification TypeError.
const skipRawBody = (middleware) => (req, res, next) =>
  Buffer.isBuffer(req.body) ? next() : middleware(req, res, next);
app.use(skipRawBody(mongoSanitize()));
app.use(skipRawBody(xssClean()));

// ─── HTTP Request Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// ─── Global Rate Limiter ───────────────────────────────────────────────────
app.use("/api", globalLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Luxury Hotel Booking API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
