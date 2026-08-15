const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");
const {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  verifyRefreshToken,
  verifyEmailToken,
} = require("../../utils/generateToken");
const { deleteCache } = require("../../config/redis");
const emailService = require("../notifications/email.service");
const logger = require("../../config/logger");

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, phone, password }) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: password,
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken({
      id: user._id,
      email: user.email,
    });

    // Store token in user record
    user.emailVerificationToken = verificationToken;
    await user.save({ validateBeforeSave: false });

    // Queue welcome email with verification link
    try {
      await emailService.sendWelcomeEmail(user, verificationToken);
    } catch (err) {
      logger.warn(`Failed to send welcome email to ${user.email}: ${err.message}`);
    }

    return user.toSafeObject();
  }

  /**
   * Login user and return tokens
   */
  async login({ email, password }) {
    // Fetch user with password (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash +refreshToken"
    );

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Your account has been deactivated. Please contact support.");
    }

    // Verify password first (avoids leaking verification status via a 403 on
    // wrong credentials).
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    // Hard requirement: unverified accounts must NEVER authenticate. No access
    // or refresh tokens are issued and no session is created until the email is
    // verified.
    if (!user.isEmailVerified) {
      throw ApiError.forbidden("Please verify your email before logging in.");
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Hash and store refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout user - invalidate refresh token
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    // Clear user cache
    await deleteCache(`user:${userId}`);
  }

  /**
   * Rotate refresh token and issue new access token
   */
  async refreshTokens(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token required.");
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token.");
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || !user.refreshToken) {
      throw ApiError.unauthorized("Invalid session. Please log in again.");
    }

    // Verify stored refresh token matches
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      // Possible token reuse attack - invalidate all
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
      throw ApiError.unauthorized("Session compromised. Please log in again.");
    }

    // Unverified accounts must not obtain fresh tokens through a refresh either.
    if (!user.isEmailVerified) {
      throw ApiError.forbidden("Please verify your email before logging in.");
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: user.toSafeObject(),
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token) {
    let decoded;
    try {
      decoded = verifyEmailToken(token);
    } catch {
      throw ApiError.badRequest("Invalid or expired verification link.");
    }

    const user = await User.findById(decoded.id).select("+emailVerificationToken");
    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    if (user.isEmailVerified) {
      throw ApiError.conflict("Email is already verified.");
    }

    // Defense-in-depth: the presented token must match the one stored on the user
    // (JWT signature/expiry is already checked; this also invalidates a replayed
    // token after rotation).
    if (!user.emailVerificationToken || user.emailVerificationToken !== token) {
      throw ApiError.badRequest("Verification link is invalid or has expired.");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return user.toSafeObject();
  }

  /**
   * Resend the email verification link for an unverified account.
   * Always returns success to avoid leaking which emails exist.
   */
  async resendVerificationEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    // No user, deactivated, or already verified → silently do nothing (anti-enumeration)
    if (!user || !user.isActive || user.isEmailVerified) {
      return;
    }

    // Generate a fresh verification token (invalidates any previously sent one)
    const verificationToken = generateEmailVerificationToken({
      id: user._id,
      email: user.email,
    });

    user.emailVerificationToken = verificationToken;
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendWelcomeEmail(user, verificationToken);
    } catch (err) {
      logger.warn(`Failed to resend verification email to ${user.email}: ${err.message}`);
      throw ApiError.internal("Failed to send verification email. Please try again.");
    }

    return user.toSafeObject();
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      return;
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      throw ApiError.internal("Failed to send reset email. Please try again.");
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordHash");

    if (!user) {
      throw ApiError.badRequest("Password reset link is invalid or has expired.");
    }

    // Update password
    user.passwordHash = newPassword; // Pre-save hook will hash it
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return user.toSafeObject();
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw ApiError.unauthorized("Current password is incorrect.");
    }

    user.passwordHash = newPassword;
    user.refreshToken = null; // Invalidate other sessions
    await user.save();

    return user.toSafeObject();
  }

  /**
   * Get current user
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found.");
    }
    return user.toSafeObject();
  }
}

module.exports = new AuthService();
