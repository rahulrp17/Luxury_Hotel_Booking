const Hotel = require("../hotels/hotel.model");
const Room = require("../rooms/room.model");
const Review = require("../reviews/review.model");
const { getCache, setCache } = require("../../config/redis");

class StatisticsService {
  /**
   * Public home statistics. Mirrors the shape the frontend Home Stats section
   * derives client-side from featured hotels (properties / avgRating / reviews /
   * destinations) so either source yields the same numbers, plus headline room
   * and user counts for broader site-wide hero figures.
   */
  async getHomeStats() {
    const cacheKey = "statistics:home";
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const [activeHotels, rooms, reviews] = await Promise.all([
      Hotel.find({ isActive: true }).select("avgRating starRating totalReviews address").lean(),
      Room.countDocuments({ isActive: true }),
      Review.countDocuments({ isVerified: true }),
    ]);

    const ratings = activeHotels
      .map((h) => h.avgRating || h.starRating || 0)
      .filter((r) => r > 0);
    const avgRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "5.0";

    const totalReviews = activeHotels.reduce(
      (sum, h) => sum + (h.totalReviews || 0),
      0
    );
    const destinations = new Set(
      activeHotels.map((h) => h.address && h.address.city).filter(Boolean)
    ).size;

    const shaped = {
      properties: activeHotels.length,
      avgRating: Number(avgRating),
      reviews: totalReviews,
      destinations: destinations || activeHotels.length,
      rooms,
      happyCustomers: reviews,
    };

    await setCache(cacheKey, shaped, 300);
    return shaped;
  }
}

module.exports = new StatisticsService();