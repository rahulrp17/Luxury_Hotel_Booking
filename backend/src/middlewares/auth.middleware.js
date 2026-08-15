const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/generateToken");
const User = require("../modules/users/user.model");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Protect routes - verify JWT access token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ApiError.unauthorized("Access token required. Please log in.");
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Access token expired. Please refresh.");
    }
    throw ApiError.unauthorized("Invalid access token.");
  }

  // Find user
  const user = await User.findById(decoded.id).select("-passwordHash -refreshToken");

  if (!user) {
    throw ApiError.unauthorized("User no longer exists.");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated. Contact support.");
  }

  // Unverified accounts must not access protected APIs, even with a valid
  // (old) token. Tokens only become usable once the email is verified.
  if (!user.isEmailVerified) {
    throw ApiError.forbidden("Please verify your email before logging in.");
  }

  // Attach user to request
  req.user = user;
  next();
});

module.exports = { protect };
