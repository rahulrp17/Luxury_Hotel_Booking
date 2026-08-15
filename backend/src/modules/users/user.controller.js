const userService = require("./user.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  return ApiResponse.success(res, "Profile fetched.", user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return ApiResponse.success(res, "Profile updated successfully.", user);
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user._id, req.file);
  return ApiResponse.success(res, "Avatar updated successfully.", user);
});

// Admin Controllers
const getAllUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllUsers(req.query);
  return ApiResponse.paginated(res, "Users fetched.", users, pagination);
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id);
  const action = user.isActive ? "enabled" : "disabled";
  return ApiResponse.success(res, `User account ${action}.`, user);
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllUsers,
  toggleUserStatus,
};
