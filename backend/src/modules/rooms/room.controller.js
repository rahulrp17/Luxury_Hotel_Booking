const roomService = require("./room.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

const getRoomsByHotel = asyncHandler(async (req, res) => {
  const { rooms, pagination } = await roomService.getRoomsByHotel(req.params.hotelId, req.query);
  return ApiResponse.paginated(res, "Rooms fetched.", rooms, pagination);
});

const getRooms = asyncHandler(async (req, res) => {
  const { rooms, pagination } = await roomService.getRooms(req.query);
  return ApiResponse.paginated(res, "Rooms fetched.", rooms, pagination);
});

const getFeaturedRooms = asyncHandler(async (req, res) => {
  const { rooms, pagination } = await roomService.getFeaturedRooms(req.query);
  return ApiResponse.paginated(res, "Featured rooms fetched.", rooms, pagination);
});

const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  return ApiResponse.success(res, "Room fetched.", room);
});

const getRoomAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  const data = await roomService.getRoomAvailability(req.params.id, checkIn, checkOut);
  return ApiResponse.success(res, "Availability checked.", data);
});

const getBlockedDates = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dates = await roomService.getBlockedDates(req.params.id, startDate, endDate);
  return ApiResponse.success(res, "Blocked dates fetched.", { blockedDates: dates });
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body);
  return ApiResponse.created(res, "Room created.", room);
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body);
  return ApiResponse.success(res, "Room updated.", room);
});

const deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.params.id);
  return ApiResponse.success(res, "Room deleted.");
});

const addRoomImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw ApiError.badRequest("Upload at least one image.");
  const room = await roomService.addRoomImages(req.params.id, req.files);
  return ApiResponse.success(res, "Images added.", room);
});

const removeRoomImage = asyncHandler(async (req, res) => {
  const room = await roomService.removeRoomImage(req.params.id, req.params.imageId);
  return ApiResponse.success(res, "Room image removed successfully.", room);
});

module.exports = {
  getRooms,
  getFeaturedRooms,
  getRoomsByHotel,
  getRoomById,
  getRoomAvailability,
  getBlockedDates,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomImages,
  removeRoomImage,
};
