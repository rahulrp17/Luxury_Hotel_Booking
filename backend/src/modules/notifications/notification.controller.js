const notificationService = require("./notification.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getUserNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  return ApiResponse.paginated(res, "Notifications fetched.", result.notifications, result.pagination, result.unreadCount);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return ApiResponse.success(res, "Notification marked as read.", notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return ApiResponse.success(res, "All notifications marked as read.");
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  return ApiResponse.success(res, "Notification deleted.");
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
