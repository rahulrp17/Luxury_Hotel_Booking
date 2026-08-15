const analyticsService = require("./analytics.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview();
  return ApiResponse.success(res, "Analytics overview fetched.", data);
});

const getRevenueChartData = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRevenueChartData();
  return ApiResponse.success(res, "Revenue chart data fetched.", data);
});

const getOccupancyData = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOccupancyData();
  return ApiResponse.success(res, "Occupancy data fetched.", data);
});

const getTopHotels = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopHotels();
  return ApiResponse.success(res, "Top hotels fetched.", data);
});

const getBookingSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBookingSummary();
  return ApiResponse.success(res, "Booking summary fetched.", data);
});

module.exports = {
  getOverview,
  getRevenueChartData,
  getOccupancyData,
  getTopHotels,
  getBookingSummary,
};
