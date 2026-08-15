const bookingService = require("./booking.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const { USER_ROLES } = require("../../config/constants");

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  return ApiResponse.created(res, "Booking created. Pending payment.", booking);
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { bookings, pagination } = await bookingService.getUserBookings(req.user._id, req.query);
  return ApiResponse.paginated(res, "Bookings fetched successfully.", bookings, pagination);
});

const getBookingById = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const booking = await bookingService.getBookingById(req.params.id, req.user._id, isAdmin);
  return ApiResponse.success(res, "Booking details fetched.", booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const result = await bookingService.cancelBooking(req.params.id, req.user._id, reason);
  const message = result.refund
    ? "Booking cancelled and refund initiated successfully."
    : "Booking cancelled successfully.";
  // Flatten so the frontend booking-slice merge (…detail, …payload) updates the
  // status/cancellation fields AND carries the refund info on the same object.
  const bookingPayload =
    result.booking && typeof result.booking.toObject === "function"
      ? result.booking.toObject({ virtuals: true })
      : result.booking;
  return ApiResponse.success(res, message, { ...bookingPayload, refund: result.refund });
});

// Admin Controllers
const getAllBookings = asyncHandler(async (req, res) => {
  const { bookings, pagination } = await bookingService.getAllBookings(req.query);
  return ApiResponse.paginated(res, "All bookings fetched.", bookings, pagination);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(req.params.id, status);
  return ApiResponse.success(res, "Booking status updated.", booking);
});

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
