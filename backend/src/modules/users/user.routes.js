const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { uploadLimiter } = require("../../middlewares/rateLimiter");
const { uploadAvatar } = require("../../config/cloudinary");
const { updateProfileValidator } = require("./user.validator");

// All routes require authentication
router.use(protect);

// User routes
router.get("/profile", userController.getProfile);
router.put("/profile", updateProfileValidator, validate, userController.updateProfile);
router.post("/avatar", uploadLimiter, uploadAvatar.single("avatar"), userController.uploadAvatar);

// Admin routes
router.get("/admin/all", adminOnly, userController.getAllUsers);
router.patch("/admin/:id/toggle", adminOnly, userController.toggleUserStatus);

module.exports = router;
