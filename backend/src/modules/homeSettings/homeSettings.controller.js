const homeSettingsService = require("./homeSettings.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await homeSettingsService.getSettings();
  return ApiResponse.success(res, "Home settings fetched.", settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await homeSettingsService.updateSettings(req.body);
  return ApiResponse.success(res, "Home settings updated.", settings);
});

const resetSettings = asyncHandler(async (_req, res) => {
  const settings = await homeSettingsService.resetSettings();
  return ApiResponse.success(res, "Home settings reset to defaults.", settings);
});

module.exports = { getSettings, updateSettings, resetSettings };