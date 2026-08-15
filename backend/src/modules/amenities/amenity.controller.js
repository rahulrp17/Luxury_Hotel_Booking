const amenityService = require("./amenity.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

const getAmenities = asyncHandler(async (req, res) => {
  const { amenities, pagination } = await amenityService.getAmenities(req.query);
  
  return ApiResponse.paginated(res, "Amenities fetched.", amenities, pagination);
});

const getAmenity = asyncHandler(async (req, res) => {
  const amenity = await amenityService.getAmenity(req.params.id);
  return ApiResponse.success(res, "Amenity fetched.", amenity);
});

const createAmenity = asyncHandler(async (req, res) => {
  const amenity = await amenityService.createAmenity(req.body);
  return ApiResponse.created(res, "Amenity created.", amenity);
});

const updateAmenity = asyncHandler(async (req, res) => {
  const amenity = await amenityService.updateAmenity(req.params.id, req.body);
  return ApiResponse.success(res, "Amenity updated.", amenity);
});

const deleteAmenity = asyncHandler(async (req, res) => {
  await amenityService.deleteAmenity(req.params.id);
  return ApiResponse.success(res, "Amenity deleted.");
});

const uploadAmenityImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("Please upload an image.");
  }
  const amenity = await amenityService.uploadImage(req.params.id, req.file);
  return ApiResponse.success(res, "Amenity image uploaded.", amenity);
});

const removeAmenityImage = asyncHandler(async (req, res) => {
  const amenity = await amenityService.removeImage(req.params.id);
  return ApiResponse.success(res, "Amenity image removed.", amenity);
});

module.exports = {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  uploadAmenityImage,
  removeAmenityImage,
};
