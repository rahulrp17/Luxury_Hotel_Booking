const authService = require("./auth.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
} = require("../../utils/generateToken");

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const user = await authService.register({ name, email, phone, password });
  return ApiResponse.created(res, "Account created successfully. Please verify your email.", user);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  // Set refresh token as HttpOnly cookie
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

  return ApiResponse.success(res, "Login successful.", { user, accessToken });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res.clearCookie("refreshToken", getClearCookieOptions());
  return ApiResponse.success(res, "Logged out successfully.");
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshTokens(token);

  res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  return ApiResponse.success(res, "Token refreshed.", { accessToken, user });
});

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  return ApiResponse.success(res, "Email verified successfully.", user);
});

/**
 * @desc    Resend email verification link
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.body.email);
  return ApiResponse.success(
    res,
    "If your email is registered and unverified, a new verification link has been sent."
  );
});

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Always return success to prevent email enumeration
  return ApiResponse.success(
    res,
    "If an account with that email exists, a reset link has been sent."
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await authService.resetPassword(req.params.token, password);
  return ApiResponse.success(res, "Password reset successfully. Please log in.", user);
});

/**
 * @desc    Change password (authenticated)
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.clearCookie("refreshToken", getClearCookieOptions());
  return ApiResponse.success(res, "Password changed. Please log in again.");
});

/**
 * @desc    Get current authenticated user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return ApiResponse.success(res, "User profile fetched.", user);
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
