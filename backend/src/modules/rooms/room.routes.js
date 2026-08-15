const express = require("express");
const router = express.Router();
const roomController = require("./room.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { uploadLimiter } = require("../../middlewares/rateLimiter");
const { uploadRoomImages } = require("../../config/cloudinary");
const {
  createRoomValidator,
  updateRoomValidator,
  roomsQueryValidator,
  featuredRoomsQueryValidator,
  availabilityQueryValidator,
  blockedDatesQueryValidator,
} = require("./room.validator");
const { CACHE_TTL } = require("../../config/constants");

// Public routes
router.get(
  "/",
  roomsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("rooms:list", req.query), CACHE_TTL.ROOM_LIST),
  roomController.getRooms
);
router.get(
  "/featured",
  featuredRoomsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("rooms:featured", req.query), CACHE_TTL.ROOM_LIST),
  roomController.getFeaturedRooms
);
router.get("/hotel/:hotelId", roomsQueryValidator, validate, cacheMiddleware((req) => queryCacheKey(`rooms:hotel:${req.params.hotelId}`, req.query), CACHE_TTL.ROOM_LIST), roomController.getRoomsByHotel);
router.get("/:id", cacheMiddleware((req) => `room:${req.params.id}`, CACHE_TTL.ROOM_LIST), roomController.getRoomById);
router.get("/:id/availability", availabilityQueryValidator, validate, roomController.getRoomAvailability);
router.get("/:id/blocked-dates", blockedDatesQueryValidator, validate, roomController.getBlockedDates);

// Admin only routes
router.use(protect, adminOnly);
router.post("/", createRoomValidator, validate, roomController.createRoom);
router.put("/:id", updateRoomValidator, validate, roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);
router.post("/:id/images", uploadLimiter, uploadRoomImages.array("images", 8), roomController.addRoomImages);
router.delete("/:id/images/:imageId", roomController.removeRoomImage);
module.exports = router;
