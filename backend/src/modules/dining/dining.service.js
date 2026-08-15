const Dining = require("./dining.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { getCache, setCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");

class DiningService {
  /**
   * Map lean docs to the Home "Dining card" shape (title, subtitle, image,
   * hotel+city, description + a convenience `imageUrl` string).
   */
  _shape(items) {
    return (items || []).map((d) => ({
      ...d,
      imageUrl: d.image?.url || null,
      primaryImage: d.image || null,
    }));
  }

  /**
   * GET /dining — public, filterable, paginated dining venues.
   */
  async getDining(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };

    if (query.isFeatured === "true") filter.isFeatured = true;
    if (query.city) filter.city = new RegExp(escapeRegex(query.city), "i");
    if (query.cuisine) filter.cuisine = new RegExp(escapeRegex(query.cuisine), "i");
    if (query.search) {
      filter.title = new RegExp(escapeRegex(query.search), "i");
    }

    const sort = { isFeatured: -1, sortOrder: 1, createdAt: -1 };

    const [items, total] = await Promise.all([
      Dining.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Dining.countDocuments(filter),
    ]);

    return {
      dining: this._shape(items),
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * GET /dining/featured — short list for the Home section.
   */
  async getFeaturedDining(query) {
    const { limit } = parsePagination(query);
    const cacheKey = `dining:featured:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const items = await Dining.find({ isActive: true, isFeatured: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    const shaped = { dining: this._shape(items) };
    await setCache(cacheKey, shaped, CACHE_TTL.FEATURED_HOTELS);
    return shaped;
  }

  async getDiningById(id) {
    const dining = await Dining.findOne({ _id: id, isActive: true }).lean();
    if (!dining) throw ApiError.notFound("Dining experience not found.");
    return dining;
  }

  async createDining(data) {
    const dining = await Dining.create(data);
    await deleteCacheByPattern("dining:*");
    return dining;
  }

  async updateDining(id, data) {
    const dining = await Dining.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!dining) throw ApiError.notFound("Dining experience not found.");
    await deleteCacheByPattern("dining:*");
    return dining;
  }

  /** Soft delete (isActive = false). */
  async deleteDining(id) {
    const dining = await Dining.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!dining) throw ApiError.notFound("Dining experience not found.");
    await deleteCacheByPattern("dining:*");
    return dining;
  }
}

module.exports = new DiningService();