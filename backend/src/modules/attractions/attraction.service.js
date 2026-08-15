const Attraction = require("./attraction.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { getCache, setCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");

class AttractionService {
  /**
   * GET /attractions — public, filterable, paginated attractions.
   */
  async getAttractions(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };

    if (query.city) filter.city = new RegExp(escapeRegex(query.city), "i");
    if (query.category) filter.category = query.category;
    if (query.hotelRef) filter.hotelRef = query.hotelRef;
    if (query.search) filter.name = new RegExp(escapeRegex(query.search), "i");

    const [items, total] = await Promise.all([
      Attraction.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attraction.countDocuments(filter),
    ]);

    return { attractions: items, pagination: buildPagination(page, limit, total) };
  }

  async getNearbyAttractions(lat, lng, radiusKm = 10, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const km = Number(radiusKm);
    const maxDistance = (Number.isFinite(km) && km > 0 ? km : 10) * 1000;
    const coordinates = [Number(lng), Number(lat)];

    const match = { isActive: true };
    if (query.category) match.category = query.category;

    // `$geoNear` (aggregation) instead of the `$near` cursor operator: MongoDB
    // forbids combining `$near` with `.skip()`/`.limit()` on a find cursor
    // ("requires sorting boolean = true"), which made `nearby` 500 on any page
    // > 0. `$geoNear` supports skip/limit natively and returns a `distance`
    // field we project away so the response shape matches a plain `.lean()`.
    const [items, total] = await Promise.all([
      Attraction.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates },
            distanceField: "distance",
            maxDistance,
            spherical: true,
            query: match,
          },
        },
        { $skip: skip },
        { $limit: limit },
        { $project: { distance: 0 } },
      ]),
      Attraction.countDocuments({
        ...match,
        location: { $geoWithin: { $centerSphere: [coordinates, maxDistance / 6371000] } },
      }),
    ]);

    return { attractions: items, pagination: buildPagination(page, limit, total) };
  }

  /**
   * GET /attractions/featured — short curated list for the Home section.
   */
  async getFeaturedAttractions(query) {
    const { limit } = parsePagination(query);
    const cacheKey = `attractions:featured:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const items = await Attraction.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    const shaped = { attractions: items };
    await setCache(cacheKey, shaped, CACHE_TTL.FEATURED_HOTELS);
    return shaped;
  }

  async getAttractionById(id) {
    const item = await Attraction.findOne({ _id: id, isActive: true }).lean();
    if (!item) throw ApiError.notFound("Attraction not found.");
    return item;
  }

  async createAttraction(data) {
    const item = await Attraction.create(data);
    await deleteCacheByPattern("attractions:*");
    return item;
  }

  async updateAttraction(id, data) {
    const item = await Attraction.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound("Attraction not found.");
    await deleteCacheByPattern("attractions:*");
    return item;
  }

  /** Soft delete. */
  async deleteAttraction(id) {
    const item = await Attraction.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) throw ApiError.notFound("Attraction not found.");
    await deleteCacheByPattern("attractions:*");
    return item;
  }
}

module.exports = new AttractionService();