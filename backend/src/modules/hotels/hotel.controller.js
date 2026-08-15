const hotelService = require("./hotel.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

const getHotels = asyncHandler(async (req, res) => {
  const { hotels, pagination } = await hotelService.getHotels(req.query);
  return ApiResponse.paginated(res, "Hotels fetched successfully.", hotels, pagination);
});

const getAdminHotels = asyncHandler(async (req, res) => {
  const { hotels, pagination } = await hotelService.getAdminHotels(req.query);
  return ApiResponse.paginated(res, "Hotels fetched successfully.", hotels, pagination);
});

const getHotelById = asyncHandler(async (req, res) => {
  const hotel = await hotelService.getHotelById(req.params.id);
  return ApiResponse.success(res, "Hotel fetched successfully.", hotel);
});

const searchHotels = asyncHandler(async (req, res) => {
  const { hotels, pagination } = await hotelService.searchHotels(req.query);
  return ApiResponse.paginated(res, "Search results.", hotels, pagination);
});

const getNearbyHotels = asyncHandler(async (req, res) => {
  const { lat, lng, distance } = req.query;

  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (lat === undefined || lng === undefined || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    throw ApiError.badRequest("Valid latitude and longitude are required.");
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    throw ApiError.badRequest("Latitude/Longitude out of range.");
  }

  const hotels = await hotelService.getNearbyHotels(latNum, lngNum, distance, req.query);
  return ApiResponse.success(res, "Nearby hotels fetched.", hotels);
});

const getFeaturedHotels = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const hotels = await hotelService.getFeaturedHotels(limit);
  return ApiResponse.success(res, "Featured hotels fetched.", hotels);
});

const createHotel = asyncHandler(async (req, res) => {
  const hotel = await hotelService.createHotel(req.body, req.user._id);
  return ApiResponse.created(res, "Hotel created successfully.", hotel);
});

const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await hotelService.updateHotel(req.params.id, req.body);
  return ApiResponse.success(res, "Hotel updated successfully.", hotel);
});

const deleteHotel = asyncHandler(async (req, res) => {
  await hotelService.deleteHotel(req.params.id);
  return ApiResponse.success(res, "Hotel deleted successfully.");
});

const addHotelImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest("Please upload at least one image.");
  }
  const hotel = await hotelService.addHotelImages(req.params.id, req.files);
  return ApiResponse.success(res, "Images uploaded successfully.", hotel);
});

const removeHotelImage = asyncHandler(async (req, res) => {
  const hotel = await hotelService.removeHotelImage(req.params.id, req.params.imageId);
  return ApiResponse.success(res, "Image removed successfully.", hotel);
});

const setPrimaryHotelImage = asyncHandler(async (req, res) => {
  const hotel = await hotelService.setPrimaryHotelImage(req.params.id, req.params.imageId);
  return ApiResponse.success(res, "Primary image updated.", hotel);
});

module.exports = {
  getHotels,
  getAdminHotels,
  getHotelById,
  searchHotels,
  getNearbyHotels,
  getFeaturedHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  addHotelImages,
  removeHotelImage,
  setPrimaryHotelImage,
};
