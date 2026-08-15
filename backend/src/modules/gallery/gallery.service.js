const GalleryItem = require("./gallery.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { getCache, setCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");

class GalleryService {
  /**
   * GET /gallery — public, filterable, paginated gallery images.
   */
  async getGalleryItems(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };

    if (query.isFeatured === "true") filter.isFeatured = true;
    if (query.category) filter.category = query.category;
    if (query.search) {
      filter.alt = new RegExp(escapeRegex(query.search), "i");
    }

    const [items, total] = await Promise.all([
      GalleryItem.find(filter)
        .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GalleryItem.countDocuments(filter),
    ]);

    return { gallery: items, pagination: buildPagination(page, limit, total) };
  }

  /**
   * GET /gallery/featured — short list for the Home masonry section.
   */
  async getFeaturedGallery(query) {
    const { limit } = parsePagination(query);
    const cacheKey = `gallery:featured:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const items = await GalleryItem.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    const shaped = { gallery: items };
    await setCache(cacheKey, shaped, CACHE_TTL.FEATURED_HOTELS);
    return shaped;
  }

  async getGalleryItemById(id) {
    const item = await GalleryItem.findOne({ _id: id, isActive: true })
      .populate("hotelRef", "name slug")
      .lean();
    if (!item) throw ApiError.notFound("Gallery item not found.");
    return item;
  }

  async createGalleryItem(data) {
    const item = await GalleryItem.create(data);
    await deleteCacheByPattern("gallery:*");
    return item;
  }

  async updateGalleryItem(id, data) {
    const item = await GalleryItem.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound("Gallery item not found.");
    await deleteCacheByPattern("gallery:*");
    return item;
  }

  /** Soft delete. */
  async deleteGalleryItem(id) {
    const item = await GalleryItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) throw ApiError.notFound("Gallery item not found.");
    await deleteCacheByPattern("gallery:*");
    return item;
  }
}

module.exports = new GalleryService();