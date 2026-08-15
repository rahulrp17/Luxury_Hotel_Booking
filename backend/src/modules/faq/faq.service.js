const Faq = require("./faq.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { getCache, setCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");

class FaqService {
  /**
   * GET /faqs — public, active FAQs.
   */
  async getFaqs(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };

    if (query.category) filter.category = query.category;
    if (query.search) filter.title = new RegExp(escapeRegex(query.search), "i");

    const [items, total] = await Promise.all([
      Faq.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
      Faq.countDocuments(filter),
    ]);

    return { faqs: items, pagination: buildPagination(page, limit, total) };
  }

  /**
   * GET /faqs/all — all active FAQs (Home accordion consumes the whole set).
   */
  async getPublicFaqs(query) {
    const { limit } = parsePagination(query);
    const cacheKey = `faqs:public:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const items = await Faq.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).limit(limit).lean();
    const shaped = { faqs: items };
    await setCache(cacheKey, shaped, CACHE_TTL.FEATURED_HOTELS);
    return shaped;
  }

  async getFaqById(id) {
    const item = await Faq.findOne({ _id: id, isActive: true }).lean();
    if (!item) throw ApiError.notFound("FAQ not found.");
    return item;
  }

  async createFaq(data) {
    const item = await Faq.create(data);
    await deleteCacheByPattern("faqs:*");
    return item;
  }

  async updateFaq(id, data) {
    const item = await Faq.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound("FAQ not found.");
    await deleteCacheByPattern("faqs:*");
    return item;
  }

  /** Soft delete. */
  async deleteFaq(id) {
    const item = await Faq.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) throw ApiError.notFound("FAQ not found.");
    await deleteCacheByPattern("faqs:*");
    return item;
  }
}

module.exports = new FaqService();