const jwt = require("jsonwebtoken");

/**
 * Generate JWT Access Token (short-lived)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
    issuer: "luxury-hotel-api",
    audience: "luxury-hotel-client",
  });
};

/**
 * Generate JWT Refresh Token (long-lived)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    issuer: "luxury-hotel-api",
    audience: "luxury-hotel-client",
  });
};

/**
 * Generate Email Verification Token
 */
const generateEmailVerificationToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_EMAIL_VERIFY_SECRET, {
    expiresIn: process.env.JWT_EMAIL_VERIFY_EXPIRE || "24h",
  });
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: "luxury-hotel-api",
    audience: "luxury-hotel-client",
  });
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "luxury-hotel-api",
    audience: "luxury-hotel-client",
  });
};

/**
 * Verify Email Verification Token
 */
const verifyEmailToken = (token) => {
  return jwt.verify(token, process.env.JWT_EMAIL_VERIFY_SECRET);
};

/**
 * Parse a duration string (e.g. "7d", "30d", "15m", "2h", "90s") into
 * milliseconds so the refresh cookie lifetime matches the JWT expiry.
 */
const parseDurationToMs = (duration) => {
  const value = parseInt(duration, 10);
  if (!Number.isFinite(value)) {
    return 7 * 24 * 60 * 60 * 1000; // 7 days fallback
  }
  const unit =
    String(duration).replace(/^[\d\s]+/i, "").toLowerCase() || "s";
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] || 1000);
};

/**
 * Cookie options for refresh token.
 *
 * Production is hosted on Vercel, where the frontend and API live on separate
 * *.vercel.app sites, so the cookie must be SameSite=None + Secure for browsers
 * to send it on the cross-site refresh request; otherwise users are logged out
 * every time the access token expires (~15 min).
 */
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: parseDurationToMs(process.env.JWT_REFRESH_EXPIRE || "7d"),
  path: "/api/v1/auth",
});

/**
 * Clear refresh token cookie options
 */
const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/v1/auth",
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
};
