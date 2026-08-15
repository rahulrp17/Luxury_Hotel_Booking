const HeroBanner = require("./heroBanner.model");
const ApiError = require("../../utils/ApiError");
const { deleteCacheByPattern } = require("../../config/redis");

class HeroBannerService {
  /**
   * GET /hero-banner — the single active banner (or newest if none flagged).
   * Caching is handled by the route's cacheMiddleware so the service layer stays
   * a single source of truth (avoids a redundant second cache layer).
   */
  async getActiveBanner() {
    let banner = await HeroBanner.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    if (!banner) {
      // Fall back to newest even if inactive so the banner never 404s on a
      // freshly-seeded database.
      banner = await HeroBanner.findOne().sort({ createdAt: -1 }).lean();
    }

    return { banner };
  }

  async getAllBanners() {
    return HeroBanner.find().sort({ isActive: -1, createdAt: -1 }).lean();
  }

  async createBanner(data) {
    const banner = await HeroBanner.create(data);
    await deleteCacheByPattern("heroBanner:*");
    return banner;
  }

  async updateBanner(id, data) {
    const banner = await HeroBanner.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!banner) throw ApiError.notFound("Hero banner not found.");
    await deleteCacheByPattern("heroBanner:*");
    return banner;
  }

  async deleteBanner(id) {
    const banner = await HeroBanner.findByIdAndDelete(id);
    if (!banner) throw ApiError.notFound("Hero banner not found.");
    await deleteCacheByPattern("heroBanner:*");
    return true;
  }
}

module.exports = new HeroBannerService();