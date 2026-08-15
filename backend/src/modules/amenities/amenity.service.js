const Amenity = require("./amenity.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { deleteCacheByPattern } = require("../../config/redis");

class AmenityService {
  async getAmenities(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.search) filter.name = new RegExp(escapeRegex(query.search), "i");

    const [amenities, total] = await Promise.all([
      Amenity.find(filter)
        .select("name image icon description category")
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Amenity.countDocuments(filter),
    ]);

    return { amenities, pagination: buildPagination(page, limit, total) };
  }

  async getAmenity(id) {
    const amenity = await Amenity.findById(id);
    if (!amenity) throw ApiError.notFound("Amenity not found.");
    return amenity;
  }

  async createAmenity(data) {
    const existing = await Amenity.findOne({ name: String(data.name || "").trim() });
    if (existing) throw ApiError.conflict("An amenity with this name already exists.");
    const amenity = await Amenity.create(data);
    await this._invalidateCache();
    return amenity;
  }

  async updateAmenity(id, data) {
    const amenity = await Amenity.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!amenity) throw ApiError.notFound("Amenity not found.");
    await this._invalidateCache();
    return amenity;
  }

  async deleteAmenity(id) {
    const amenity = await Amenity.findByIdAndDelete(id);
    if (!amenity) throw ApiError.notFound("Amenity not found.");
    await this._invalidateCache();
    return true;
  }

  async _invalidateCache() {
    await deleteCacheByPattern("amenities:*");
  }
}

module.exports = new AmenityService();