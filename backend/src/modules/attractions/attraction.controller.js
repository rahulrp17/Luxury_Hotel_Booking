const attractionService = require("./attraction.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

const getAttractions = asyncHandler(async (req, res) => {
  const { attractions, pagination } = await attractionService.getAttractions(req.query);
  return ApiResponse.paginated(res, "Attractions fetched.", attractions, pagination);
});

const getNearbyAttractions = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm } = req.query;
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (lat === undefined || lng === undefined || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    throw ApiError.badRequest("Valid latitude and longitude are required.");
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    throw ApiError.badRequest("Latitude/Longitude out of range.");
  }

  const { attractions, pagination } = await attractionService.getNearbyAttractions(latNum, lngNum, radiusKm, req.query);
  return ApiResponse.paginated(res, "Nearby attractions fetched.", attractions, pagination);
});

const getFeaturedAttractions = asyncHandler(async (req, res) => {
  const { attractions } = await attractionService.getFeaturedAttractions(req.query);
  return ApiResponse.success(res, "Featured attractions fetched.", attractions);
});

const getAttractionById = asyncHandler(async (req, res) => {
  const item = await attractionService.getAttractionById(req.params.id);
  return ApiResponse.success(res, "Attraction fetched.", item);
});

const createAttraction = asyncHandler(async (req, res) => {
  const item = await attractionService.createAttraction(req.body);
  return ApiResponse.created(res, "Attraction created.", item);
});

const updateAttraction = asyncHandler(async (req, res) => {
  const item = await attractionService.updateAttraction(req.params.id, req.body);
  return ApiResponse.success(res, "Attraction updated.", item);
});

const deleteAttraction = asyncHandler(async (req, res) => {
  await attractionService.deleteAttraction(req.params.id);
  return ApiResponse.success(res, "Attraction deleted.");
});

module.exports = {
  getAttractions,
  getNearbyAttractions,
  getFeaturedAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
};