const statisticsService = require("./statistics.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getHomeStats = asyncHandler(async (_req, res) => {
  const stats = await statisticsService.getHomeStats();
  return ApiResponse.success(res, "Home statistics fetched.", stats);
});

module.exports = { getHomeStats };