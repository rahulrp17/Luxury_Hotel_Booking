const galleryService = require("./gallery.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getGalleryItems = asyncHandler(async (req, res) => {
  const { gallery, pagination } = await galleryService.getGalleryItems(req.query);
  return ApiResponse.paginated(res, "Gallery images fetched.", gallery, pagination);
});

const getFeaturedGallery = asyncHandler(async (req, res) => {
  const { gallery } = await galleryService.getFeaturedGallery(req.query);
  return ApiResponse.success(res, "Featured gallery images fetched.", gallery);
});

const getGalleryItemById = asyncHandler(async (req, res) => {
  const item = await galleryService.getGalleryItemById(req.params.id);
  return ApiResponse.success(res, "Gallery image fetched.", item);
});

const createGalleryItem = asyncHandler(async (req, res) => {
  const item = await galleryService.createGalleryItem(req.body);
  return ApiResponse.created(res, "Gallery image created.", item);
});

const updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await galleryService.updateGalleryItem(req.params.id, req.body);
  return ApiResponse.success(res, "Gallery image updated.", item);
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  await galleryService.deleteGalleryItem(req.params.id);
  return ApiResponse.success(res, "Gallery image deleted.");
});

module.exports = {
  getGalleryItems,
  getFeaturedGallery,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};