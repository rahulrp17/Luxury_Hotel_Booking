const Review = require("./review.model");
const Booking = require("../bookings/booking.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { BOOKING_STATUS } = require("../../config/constants");
const { deleteFromCloudinary } = require("../../config/cloudinary");
const { deleteCacheByPattern } = require("../../config/redis");

class ReviewService {
  /**
   * Get reviews for a hotel
   */
  async getHotelReviews(hotelId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { hotel: hotelId, isActive: true };

    if (query.minRating) filter["rating.overall"] = { $gte: parseFloat(query.minRating) };
    if (query.hasImages === "true") filter["images.0"] = { $exists: true };

    const sort = query.sort === "rating" ? { "rating.overall": -1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        // `helpfulVoters` is a private per-voter ObjectId list — never expose it
        // on the public endpoint (keeps the payload slimmer too).
        .select("-helpfulVoters")
        .populate("user", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Create a new review
   */
  async createReview(userId, data, files = []) {
    const { hotel, booking: bookingId, rating, title, body } = data;

    // Verify booking belongs to user and is checked out
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      hotel,
      status: { $in: [BOOKING_STATUS.CHECKED_OUT, BOOKING_STATUS.CONFIRMED] },
    });

    if (!booking) {
      throw ApiError.forbidden("You can only review hotels you have stayed at.");
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      throw ApiError.conflict("You have already reviewed this stay.");
    }

    // Handle images
    const images = files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    const review = await Review.create({
      hotel,
      user: userId,
      booking: bookingId,
      rating,
      title,
      body,
      images,
      isVerified: true,
    });

    // A new review moves the hotel's avgRating/totalReviews and the review list
    // — drop the affected caches so the next request serves fresh data.
    await deleteCacheByPattern(`reviews:hotel:${hotel}`);
    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");

    return review;
  }

  /**
   * Update own review
   */
  async updateReview(reviewId, userId, data) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw ApiError.notFound("Review not found or unauthorized.");
    }

    // Only allow updating specific fields
    if (data.rating) review.rating = data.rating;
    if (data.title) review.title = data.title;
    if (data.body) review.body = data.body;

    await review.save();

    await deleteCacheByPattern(`reviews:hotel:${review.hotel}`);
    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");
    return review;
  }

  /**
   * Delete review (User or Admin)
   */
  async deleteReview(reviewId, userId, isAdmin = false) {
    const query = { _id: reviewId };
    if (!isAdmin) {
      query.user = userId;
    }

    const review = await Review.findOne(query);
    if (!review) {
      throw ApiError.notFound("Review not found or unauthorized.");
    }

    // Delete images from Cloudinary (in parallel — no sequential await per image)
    if (review.images && review.images.length > 0) {
      await Promise.all(review.images.map((img) => deleteFromCloudinary(img.publicId)));
    }

    const hotelId = review.hotel;
    await review.deleteOne();

    await deleteCacheByPattern(`reviews:hotel:${hotelId}`);
    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");
    return true;
  }

  /**
   * Admin/Hotel: Respond to a review
   */
  async respondToReview(reviewId, responseText) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        response: {
          text: responseText,
          respondedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!review) throw ApiError.notFound("Review not found.");
    return review;
  }

  /**
   * Mark review as helpful
   */
  async toggleHelpfulVote(reviewId, userId) {
    const review = await Review.findById(reviewId);
    if (!review) throw ApiError.notFound("Review not found.");

    const voterIndex = review.helpfulVoters.indexOf(userId);
    
    if (voterIndex === -1) {
      review.helpfulVoters.push(userId);
      review.helpfulVotes += 1;
    } else {
      review.helpfulVoters.splice(voterIndex, 1);
      review.helpfulVotes -= 1;
    }

    await review.save();
    return review;
  }
}

module.exports = new ReviewService();
