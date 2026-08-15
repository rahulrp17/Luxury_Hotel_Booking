const Offer = require("./offer.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { deleteCacheByPattern } = require("../../config/redis");
const notificationService = require("../notifications/notification.service");
const logger = require("../../config/logger");

class OfferService {
  /**
   * Validate if an offer code is applicable to a specific booking amount/hotel
   */
  async validateOffer(code, amount, hotelId = null, roomId = null) {
    const offer = await Offer.findOne({ code: code.toUpperCase() });

    if (!offer) {
      throw ApiError.notFound("Offer code not found.");
    }

    if (!offer.isValid) {
      throw ApiError.badRequest("This offer has expired or reached its usage limit.");
    }

    if (amount < offer.minBookingAmount) {
      throw ApiError.badRequest(`Minimum booking amount of ${offer.minBookingAmount} required for this offer.`);
    }

    // Check hotel restrictions
    if (offer.applicableHotels.length > 0 && hotelId) {
      const isApplicable = offer.applicableHotels.some(id => id.toString() === hotelId.toString());
      if (!isApplicable) {
        throw ApiError.badRequest("This offer is not valid for this hotel.");
      }
    }

    // Check room restrictions
    if (offer.applicableRooms.length > 0 && roomId) {
      const isApplicable = offer.applicableRooms.some(id => id.toString() === roomId.toString());
      if (!isApplicable) {
        throw ApiError.badRequest("This offer is not valid for this room type.");
      }
    }

    // Return calculation data for preview
    return offer;
  }

  /**
   * Get all active offers (Public)
   */
  async getActiveOffers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true, endDate: { $gte: new Date() } };

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Offer.countDocuments(filter),
    ]);

    return {
      offers,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Admin: Get all offers
   */
  async getAllOffers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.code) filter.code = new RegExp(escapeRegex(query.code), "i");
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true";

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Offer.countDocuments(filter),
    ]);

    return {
      offers,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Admin: Create offer
   */
  async createOffer(data) {
    // Check if code exists
    const existing = await Offer.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw ApiError.conflict("Offer code already exists.");
    }

    // Force uppercase code
    data.code = data.code.toUpperCase();
    
    const offer = await Offer.create(data);
    await this._invalidateCache();

    // A newly created (active) offer is a publication — broadcast it to all
    // registered users. Fire-and-forget so the admin API never blocks on fan-out.
    if (offer.isActive) {
      this._broadcastOffer(offer);
    }
    return offer;
  }

  /**
   * Admin: Update offer
   */
  async updateOffer(id, data) {
    if (data.code) {
      data.code = data.code.toUpperCase();
      const existing = await Offer.findOne({ code: data.code, _id: { $ne: id } });
      if (existing) throw ApiError.conflict("Offer code already exists.");
    }

    const before = await Offer.findById(id);
    const offer = await Offer.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!offer) throw ApiError.notFound("Offer not found.");
    
    await this._invalidateCache();

    // Publishing: a previously inactive offer being activated is a new
    // publication — notify users. The eventKey dedupe means re-activating an
    // already-notified offer never sends a duplicate notification.
    const wasActive = !!before?.isActive;
    const nowActive = !!offer.isActive;
    if (nowActive && !wasActive) {
      this._broadcastOffer(offer);
    }
    return offer;
  }

  /**
   * Fire-and-forget fan-out of a newly published offer to all registered users.
   */
  _broadcastOffer(offer) {
    notificationService.notifyOfferCreated(offer).catch((err) =>
      logger.error(`Offer notification broadcast failed for ${offer._id}: ${err.message}`)
    );
  }

  /**
   * Increment usage count (Internal System Call)
   */
  async incrementUsage(offerId) {
    await Offer.findByIdAndUpdate(offerId, { $inc: { usedCount: 1 } });
  }

  async _invalidateCache() {
    await deleteCacheByPattern("offers:*");
  }
}

module.exports = new OfferService();