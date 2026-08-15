const reviewService = require("./review.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { USER_ROLES } = require("../../config/constants");

const getHotelReviews = asyncHandler(async (req, res) => {
  const { reviews, pagination } = await reviewService.getHotelReviews(req.params.hotelId, req.query);
  return ApiResponse.paginated(res, "Reviews fetched successfully.", reviews, pagination);
});

const createReview = asyncHandler(async (req, res) => {
  // Try to parse rating if it comes as a JSON string (due to multipart/form-data)
  if (typeof req.body.rating === "string") {
    try {
      req.body.rating = JSON.parse(req.body.rating);
    } catch (e) {
      throw ApiError.badRequest("Invalid rating format.");
    }
  }

  const review = await reviewService.createReview(req.user._id, req.body, req.files);
  return ApiResponse.created(res, "Review posted successfully.", review);
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.user._id, req.body);
  return ApiResponse.success(res, "Review updated successfully.", review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  await reviewService.deleteReview(req.params.id, req.user._id, isAdmin);
  return ApiResponse.success(res, "Review deleted successfully.");
});

const respondToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw ApiError.badRequest("Response text is required.");
  
  const review = await reviewService.respondToReview(req.params.id, text);
  return ApiResponse.success(res, "Response added successfully.", review);
});

const toggleHelpfulVote = asyncHandler(async (req, res) => {
  const review = await reviewService.toggleHelpfulVote(req.params.id, req.user._id);
  return ApiResponse.success(res, "Vote recorded.", { helpfulVotes: review.helpfulVotes });
});

module.exports = {
  getHotelReviews,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
  toggleHelpfulVote,
};
