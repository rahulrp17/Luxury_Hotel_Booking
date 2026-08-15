const Testimonial = require("./testimonial.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { getCache, setCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");

class TestimonialService {
  /**
   * GET /testimonials — public, active + filterable list.
   */
  async getTestimonials(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };

    if (query.minRating) filter.rating = { $gte: parseFloat(query.minRating) };
    if (query.verified === "true") filter.verified = true;
    if (query.country) filter.country = new RegExp(escapeRegex(query.country), "i");
    if (query.search) filter.name = new RegExp(escapeRegex(query.search), "i");

    const [items, total] = await Promise.all([
      Testimonial.find(filter)
        .sort({ isActive: -1, sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Testimonial.countDocuments(filter),
    ]);

    return { testimonials: items, pagination: buildPagination(page, limit, total) };
  }

  /**
   * GET /testimonials/featured — short curated list for the Home section.
   */
  async getFeaturedTestimonials(query) {
    const { limit } = parsePagination(query);
    const cacheKey = `testimonials:featured:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const items = await Testimonial.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    const shaped = { testimonials: items };
    await setCache(cacheKey, shaped, CACHE_TTL.FEATURED_HOTELS);
    return shaped;
  }

  async getTestimonialById(id) {
    const item = await Testimonial.findOne({ _id: id, isActive: true }).lean();
    if (!item) throw ApiError.notFound("Testimonial not found.");
    return item;
  }

  async createTestimonial(data) {
    const item = await Testimonial.create(data);
    await deleteCacheByPattern("testimonials:*");
    return item;
  }

  async updateTestimonial(id, data) {
    const item = await Testimonial.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound("Testimonial not found.");
    await deleteCacheByPattern("testimonials:*");
    return item;
  }

  /** Soft delete. */
  async deleteTestimonial(id) {
    const item = await Testimonial.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) throw ApiError.notFound("Testimonial not found.");
    await deleteCacheByPattern("testimonials:*");
    return item;
  }
}

module.exports = new TestimonialService();