const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { protect } = require("../../middlewares/auth.middleware");

// All routes require authentication
router.use(protect);

router.get("/", notificationController.getUserNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
