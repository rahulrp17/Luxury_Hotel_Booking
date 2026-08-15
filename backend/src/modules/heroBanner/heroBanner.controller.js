const heroBannerService = require("./heroBanner.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getActiveBanner = asyncHandler(async (_req, res) => {
  const data = await heroBannerService.getActiveBanner();
  return ApiResponse.success(res, "Hero banner fetched.", data.banner);
});

const getAllBanners = asyncHandler(async (_req, res) => {
  const banners = await heroBannerService.getAllBanners();
  return ApiResponse.success(res, "Hero banners fetched.", banners);
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await heroBannerService.createBanner(req.body);
  return ApiResponse.created(res, "Hero banner created.", banner);
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await heroBannerService.updateBanner(req.params.id, req.body);
  return ApiResponse.success(res, "Hero banner updated.", banner);
});

const deleteBanner = asyncHandler(async (req, res) => {
  await heroBannerService.deleteBanner(req.params.id);
  return ApiResponse.success(res, "Hero banner deleted.");
});

module.exports = {
  getActiveBanner,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};