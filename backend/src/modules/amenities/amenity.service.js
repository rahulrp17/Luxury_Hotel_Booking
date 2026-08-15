const Amenity = require("./amenity.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { deleteCacheByPattern } = require("../../config/redis");
const { deleteFromCloudinary } = require("../../config/cloudinary");
const logger = require("../../config/logger");

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
    const amenity = await Amenity.findById(id);
    if (!amenity) throw ApiError.notFound("Amenity not found.");

    // Best-effort cleanup of the Cloudinary asset when the amenity has one.
    if (amenity.imagePublicId) {
      try {
        await deleteFromCloudinary(amenity.imagePublicId);
      } catch (err) {
        // Deleting the record must not fail because cleanup did.
        logger.error(`Failed to delete Cloudinary asset for amenity ${id}: ${err.message}`);
      }
    }

    await Amenity.findByIdAndDelete(id);
    await this._invalidateCache();
    return true;
  }

  /**
   * Upload (or replace) the amenity image. When an image already exists the old
   * Cloudinary asset is removed so orphaned files never accumulate.
   */
  async uploadImage(id, file) {
    const amenity = await Amenity.findById(id);
    if (!amenity) throw ApiError.notFound("Amenity not found.");

    if (amenity.imagePublicId && amenity.imagePublicId !== file.filename) {
      await deleteFromCloudinary(amenity.imagePublicId);
    }

    amenity.image = file.path;
    amenity.imagePublicId = file.filename;
    await amenity.save();

    await this._invalidateCache();
    return amenity;
  }

  /**
   * Remove the amenity image and delete its Cloudinary asset.
   */
  async removeImage(id) {
    const amenity = await Amenity.findById(id);
    if (!amenity) throw ApiError.notFound("Amenity not found.");

    if (amenity.imagePublicId) {
      await deleteFromCloudinary(amenity.imagePublicId);
    }

    amenity.image = undefined;
    amenity.imagePublicId = undefined;
    await amenity.save();

    await this._invalidateCache();
    return amenity;
  }

  async _invalidateCache() {
    // Clear both the list cache (`amenities:list:*`) and the per-record detail
    // cache (`amenity:<id>`) so edits/uploads/removals never serve stale data.
    await Promise.all([
      deleteCacheByPattern("amenities:*"),
      deleteCacheByPattern("amenity:*"),
    ]);
  }
}

module.exports = new AmenityService();