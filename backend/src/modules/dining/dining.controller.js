const diningService = require("./dining.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getDining = asyncHandler(async (req, res) => {
  const { dining, pagination } = await diningService.getDining(req.query);
  return ApiResponse.paginated(res, "Dining experiences fetched.", dining, pagination);
});

const getFeaturedDining = asyncHandler(async (req, res) => {
  const { dining } = await diningService.getFeaturedDining(req.query);
  return ApiResponse.success(res, "Featured dining experiences fetched.", dining);
});

const getDiningById = asyncHandler(async (req, res) => {
  const item = await diningService.getDiningById(req.params.id);
  return ApiResponse.success(res, "Dining experience fetched.", item);
});

const createDining = asyncHandler(async (req, res) => {
  const item = await diningService.createDining(req.body);
  return ApiResponse.created(res, "Dining experience created.", item);
});

const updateDining = asyncHandler(async (req, res) => {
  const item = await diningService.updateDining(req.params.id, req.body);
  return ApiResponse.success(res, "Dining experience updated.", item);
});

const deleteDining = asyncHandler(async (req, res) => {
  await diningService.deleteDining(req.params.id);
  return ApiResponse.success(res, "Dining experience deleted.");
});

module.exports = {
  getDining,
  getFeaturedDining,
  getDiningById,
  createDining,
  updateDining,
  deleteDining,
};