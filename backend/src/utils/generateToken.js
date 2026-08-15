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
 * Cookie options for refresh token
 */
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/api/v1/auth",
});

/**
 * Clear refresh token cookie options
 */
const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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
