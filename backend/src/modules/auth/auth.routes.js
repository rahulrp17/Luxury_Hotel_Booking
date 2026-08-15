const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate");
const { authLimiter } = require("../../middlewares/rateLimiter");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resendVerificationValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require("./auth.validator");

// Public routes
router.post("/register", authLimiter, registerValidator, validate, authController.register);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/refresh-token", authLimiter, authController.refreshToken);
router.get("/verify-email/:token", authLimiter, authController.verifyEmail);
router.post("/resend-verification", authLimiter, resendVerificationValidator, validate, authController.resendVerification);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasswordValidator, validate, authController.resetPassword);

// Protected routes
router.use(protect);
router.get("/me", authController.getMe);
router.post("/logout", authController.logout);
router.patch("/change-password", changePasswordValidator, validate, authController.changePassword);

module.exports = router;
