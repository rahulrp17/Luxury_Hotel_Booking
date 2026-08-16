const mongoose = require("mongoose");
const Hotel = require("./hotel.model");
const Room = require("../rooms/room.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { deleteFromCloudinary } = require("../../config/cloudinary");
const { setCache, getCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL, BOOKING_STATUS } = require("../../config/constants");

/** Sort key → Mongo sort object (keeps legacy keys as aliases for backward compat). */
const HOTEL_SORTS = {
  recommended: { isFeatured: -1, avgRating: -1, totalReviews: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  rating: { avgRating: -1 },
  price_asc: { startingPrice: 1, avgRating: -1 },
  price_desc: { startingPrice: -1, avgRating: -1 },
  // Legacy aliases
  avgRating: { avgRating: -1 },
  createdAt: { createdAt: -1 },
  name: { name: 1 },
  starRating: { starRating: -1, avgRating: -1 },
};

class HotelService {
  /**
   * Get all hotels with filters, pagination, sorting and per-hotel computed
   * fields (startingPrice, totalActiveRooms, availableRooms, lowestAvailableRoom,
   * featured image, review summary). Single aggregation → no N+1.
   *
   * Public listings only return active hotels. Admin management lists pass
   * `{ includeInactive: true }` so soft-deleted / deactivated hotels stay
   * visible and editable in the admin panel.
   */
  async getHotels(query, { includeInactive = false } = {}) {
    const { page, limit, skip } = parsePagination(query);
    const pipeline = [];

    // ── 1. Base filter ─────────────────────────────────────────────────────
    const filter = includeInactive ? {} : { isActive: true };
    if (query.destination) {
      const dest = new RegExp(escapeRegex(query.destination), "i");
      filter.$or = [{ "address.city": dest }, { "address.country": dest }];
    } else {
      if (query.city) filter["address.city"] = new RegExp(escapeRegex(query.city), "i");
      if (query.country) filter["address.country"] = new RegExp(escapeRegex(query.country), "i");
    }
    if (query.category) filter.category = query.category;
    if (query.starRating) filter.starRating = parseInt(query.starRating);
    if (query.minRating) filter.avgRating = { $gte: parseFloat(query.minRating) };
    pipeline.push({ $match: filter });

    // ── 2. Amenity filter (raw ids, before they're populated) ─────────────
    if (query.amenities) {
      const list = query.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        // The `amenities` field stores ObjectIds, but the query-string values
        // arrive as hex strings. Match (`$all`) requires real ObjectIds, so
        // cast each supported id; drop anything that isn't a valid ObjectId.
        .map((s) => (mongoose.isValidObjectId(s) ? new mongoose.Types.ObjectId(s) : null))
        .filter(Boolean);
      if (list.length) pipeline.push({ $match: { amenities: { $all: list } } });
    }

    // ── 3. Rooms lookup (active, optionally capacity-filtered) ────────────
    const guests = query.guests !== undefined ? parseInt(query.guests) : 0;
    const roomMatch = { isActive: true };
    if (guests > 0) roomMatch["maxOccupancy.adults"] = { $gte: guests };

    pipeline.push({
      $lookup: {
        from: "rooms",
        let: { hotelId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$hotel", "$$hotelId"] }, ...roomMatch } },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              images: 1,
              basePricePerNight: 1,
              maxOccupancy: 1,
              totalUnits: 1,
            },
          },
        ],
        as: "rooms",
      },
    });

    // ── 4. Availability annotation when dates are supplied ────────────────
    const checkIn = query.checkIn ? new Date(query.checkIn) : null;
    const checkOut = query.checkOut ? new Date(query.checkOut) : null;
    const hasDates =
      checkIn && checkOut && !Number.isNaN(checkIn.getTime()) && !Number.isNaN(checkOut.getTime());

    if (hasDates) {
      pipeline.push({
        $lookup: {
          from: "bookings",
          let: { roomIds: "$rooms._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$room", "$$roomIds"] },
                    {
                      $in: [
                        "$status",
                        [
                          BOOKING_STATUS.CONFIRMED,
                          BOOKING_STATUS.CHECKED_IN,
                          BOOKING_STATUS.PENDING,
                        ],
                      ],
                    },
                    { $lt: ["$checkIn", checkOut] },
                    { $gt: ["$checkOut", checkIn] },
                  ],
                },
              },
            },
            { $group: { _id: "$room", count: { $sum: 1 } } },
          ],
          as: "bookingOverlaps",
        },
      });

      pipeline.push({
        $addFields: {
          rooms: {
            $map: {
              input: "$rooms",
              as: "room",
              in: {
                $mergeObjects: [
                  "$$room",
                  {
                    bookedCount: {
                      $let: {
                        vars: {
                          match: {
                            $filter: {
                              input: "$bookingOverlaps",
                              as: "o",
                              cond: { $eq: ["$$o._id", "$$room._id"] },
                            },
                          },
                        },
                        in: { $ifNull: [{ $arrayElemAt: ["$$match.count", 0] }, 0] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      });
    }

    // ── 5. Derived fields (available rooms, starting price, etc.) ──────────
    // When no dates, bookedCount is absent → $ifNull 0 → all rooms are available.
    pipeline.push(
      {
        $addFields: {
          availableRoomArray: {
            $filter: {
              input: "$rooms",
              as: "r",
              cond: { $lt: [{ $ifNull: ["$$r.bookedCount", 0] }, "$$r.totalUnits"] },
            },
          },
        },
      },
      {
        $addFields: {
          startingPrice: { $min: "$availableRoomArray.basePricePerNight" },
          totalActiveRooms: { $size: "$rooms" },
          availableRooms: { $size: "$availableRoomArray" },
          lowestAvailableRoom: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$availableRoomArray",
                  as: "r",
                  cond: { $eq: ["$$r.basePricePerNight", { $min: "$availableRoomArray.basePricePerNight" }] },
                },
              },
              0,
            ],
          },
        },
      }
    );

    // ── 6. Price filter (on computed startingPrice) ───────────────────────
    const priceFilter = {};
    if (query.minPrice !== undefined) priceFilter.startingPrice = { $gte: parseFloat(query.minPrice) };
    if (query.maxPrice !== undefined) {
      priceFilter.startingPrice = { ...(priceFilter.startingPrice || {}), $lte: parseFloat(query.maxPrice) };
    }
    if (Object.keys(priceFilter).length) pipeline.push({ $match: priceFilter });

    // ── 7. Populate amenities (docs) ──────────────────────────────────────
    pipeline.push({
      $lookup: { from: "amenities", localField: "amenities", foreignField: "_id", as: "amenities" },
    });

    // ── 8. Paginate + shape ───────────────────────────────────────────────
    const sort = HOTEL_SORTS[query.sort] || HOTEL_SORTS.recommended;
    pipeline.push({
      $facet: {
        meta: [{ $count: "total" }],
        data: [
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
              description: 1,
              shortDescription: 1,
              category: 1,
              starRating: 1,
              contact: 1,
              address: 1,
              location: 1,
              policies: 1,
              isFeatured: 1,
              isActive: 1,
              avgRating: 1,
              totalReviews: 1,
              images: 1,
              amenities: 1,
              tags: 1,
              seoMeta: 1,
              featuredImage: { $arrayElemAt: ["$images", 0] },
              startingPrice: { $ifNull: ["$startingPrice", 0] },
              totalActiveRooms: { $ifNull: ["$totalActiveRooms", 0] },
              availableRooms: { $ifNull: ["$availableRooms", 0] },
              lowestAvailableRoom: 1,
              reviewSummary: { averageRating: "$avgRating", totalReviews: "$totalReviews" },
            },
          },
        ],
      },
    });

    const [result] = await Hotel.aggregate(pipeline);
    const hotels = result?.data || [];
    const total = result?.meta?.[0]?.total || 0;

    return {
      hotels,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Get all hotels for the admin panel — same shape as getHotels but without
   * the isActive filter so deactivated/soft-deleted hotels remain visible.
   * Never served through the Redis response cache.
   */
  async getAdminHotels(query) {
    return this.getHotels(query, { includeInactive: true });
  }

  /**
   * Get single hotel by ID or slug
   */
  async getHotelById(identifier) {
    const cacheKey = `hotel:${identifier}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier, isActive: true }
      : { slug: identifier, isActive: true };

    const hotel = await Hotel.findOne(query)
      .populate("amenities", "name icon category")
      .lean();

    if (!hotel) {
      throw ApiError.notFound("Hotel not found.");
    }

    // `.lean()` strips schema virtuals, including `primaryImage` (declared on the
    // model). Derive it here so the detail/card contract always exposes it.
    const shaped = {
      ...hotel,
      primaryImage: hotel.images?.find((i) => i.isPrimary) || hotel.images?.[0] || null,
    };

    await setCache(cacheKey, shaped, CACHE_TTL.HOTEL_DETAIL);
    return shaped;
  }

  /**
   * Full-text + filter search
   */
  async searchHotels(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };
    const sort = {};

    if (query.q) {
      filter.$text = { $search: query.q };
      sort.score = { $meta: "textScore" };
    }

    if (query.city) filter["address.city"] = new RegExp(escapeRegex(query.city), "i");
    if (query.category) filter.category = query.category;
    if (query.minStars) filter.starRating = { $gte: parseInt(query.minStars) };

    // Price range filter (based on room prices - handled separately)
    const projection = query.q ? { score: { $meta: "textScore" } } : {};

    const [hotels, total] = await Promise.all([
      Hotel.find(filter, projection)
        .populate("amenities", "name icon")
        .sort(query.q ? sort : { avgRating: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Hotel.countDocuments(filter),
    ]);

    return {
      hotels,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Get hotels near coordinates
   */
  async getNearbyHotels(lat, lng, maxDistanceKm = 50, query = {}) {
    const { limit, skip } = parsePagination(query);

    // Guard against NaN/negative distance (defaults to 50km)
    const km = Number(maxDistanceKm);
    const maxDistance = Number.isFinite(km) && km > 0 ? km * 1000 : 50 * 1000;

    const hotels = await Hotel.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: maxDistance,
        },
      },
    })
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    return hotels;
  }

  /**
   * Get featured hotels
   *
   * Returns a "card shape" aligned to the frontend Home sections
   * (FeaturedHotels.jsx HotelCard reads hotel.image / hotel.rating / hotel.city;
   * Home.jsx reads primaryImage.url || images[0].url). The underlying full
   * document fields are preserved so existing consumers keep working.
   */
  async getFeaturedHotels(limit = 6) {
    const cacheKey = `hotels:featured:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const hotels = await Hotel.find({ isActive: true, isFeatured: true })
      // Slim public payload: card consumers only read name/category/rating/
      // city/image. Drop the 5000-char description, policies, seoMeta, contact,
      // owner and amenities — the /hotels/:id detail endpoint serves those.
      .select(
        "_id name slug category starRating avgRating totalReviews isFeatured images address shortDescription description"
      )
      .sort({ avgRating: -1 })
      .limit(limit)
      .lean();

    const shaped = hotels.map((h) => ({
      ...h,
      // Card contract (lean() strips virtuals, so primaryImage is derived here)
      image: h.images?.[0]?.url || null,
      rating: h.avgRating || h.starRating || 0,
      city: h.address?.city || "",
      primaryImage: h.images?.find((i) => i.isPrimary) || h.images?.[0] || null,
    }));

    await setCache(cacheKey, shaped, CACHE_TTL.FEATURED_HOTELS);
    return shaped;
  }

  /**
   * Create hotel (admin)
   */
  async createHotel(data, ownerId) {
    // Generate unique slug
    const slug = await this._generateUniqueSlug(data.name);

    const hotel = await Hotel.create({
      ...data,
      slug,
      owner: ownerId,
    });

    await deleteCacheByPattern("hotels:*");
    return hotel;
  }

  /**
   * Update hotel
   */
  async updateHotel(id, data) {
    // Only allow explicit, non-authoritative fields through. Prevents a caller
    // from overwriting owner, avgRating, totalReviews, images, isActive, _id, etc.
    const allowedFields = [
      "name", "description", "shortDescription", "category", "starRating",
      "contact", "address", "location", "policies", "isFeatured", "tags",
      "seoMeta", "amenities", "avgRating", "totalReviews", "isActive",
    ];
    const updateData = {};
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) updateData[key] = data[key];
    }

    // If name changed, regenerate slug
    if (data.name) {
      updateData.slug = await this._generateUniqueSlug(data.name, id);
    }

    const hotel = await Hotel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    if (!hotel) {
      throw ApiError.notFound("Hotel not found.");
    }

    // Clear both the `hotel:<id>` and `hotel:<slug>` detail-cache keys plus the
    // list/featured caches. The route serves detail by id OR slug, so a slug-key
    // clear is required or stale details survive for the TTL window.
    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");
    return hotel;
  }

  /**
   * Soft delete hotel.
   *
   * Cascades the deactivation to the hotel's active rooms so an inactive hotel
   * never leaves active rooms behind (or stale room-count / price data on the
   * public listings), then clears every hotel, room and detail cache key so
   * neither the admin panel nor the public site serve the pre-delete state.
   */
  async deleteHotel(id) {
    const hotel = await Hotel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!hotel) {
      throw ApiError.notFound("Hotel not found.");
    }

    // Cascade: soft-delete any active rooms belonging to this hotel.
    await Room.updateMany({ hotel: hotel._id, isActive: true }, { isActive: false });

    await Promise.all([
      deleteCacheByPattern("hotel:*"),
      deleteCacheByPattern("hotels:*"),
      deleteCacheByPattern("rooms:list*"),
      deleteCacheByPattern("rooms:featured*"),
      deleteCacheByPattern("rooms:hotel:*"),
      deleteCacheByPattern("room:*"),
    ]);
    return hotel;
  }

  /**
   * Add images to hotel
   */
  async addHotelImages(id, files) {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw ApiError.notFound("Hotel not found.");
    }

    const newImages = files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: hotel.images.length === 0 && index === 0,
    }));

    hotel.images.push(...newImages);
    await hotel.save();

    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");
    return hotel;
  }

  /**
   * Remove image from hotel. If the primary image is removed, the first
   * remaining image automatically becomes the new primary.
   */
  async removeHotelImage(id, imageId) {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw ApiError.notFound("Hotel not found.");
    }

    const image = hotel.images.id(imageId);
    if (!image) {
      throw ApiError.notFound("Image not found.");
    }

    const wasPrimary = !!image.isPrimary;

    // Delete from Cloudinary
    await deleteFromCloudinary(image.publicId);

    hotel.images.pull(imageId);

    // Reassign primary if the removed image was the primary and images remain.
    if (wasPrimary && hotel.images.length > 0) {
      hotel.images[0].isPrimary = true;
    }

    await hotel.save();

    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");
    return hotel;
  }

  /**
   * Set a hotel image as the primary image (unmarks any other primary).
   */
  async setPrimaryHotelImage(id, imageId) {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw ApiError.notFound("Hotel not found.");
    }

    const image = hotel.images.id(imageId);
    if (!image) {
      throw ApiError.notFound("Image not found.");
    }

    hotel.images.forEach((img) => {
      img.isPrimary = img._id.toString() === imageId;
    });

    await hotel.save();

    await deleteCacheByPattern("hotel:*");
    await deleteCacheByPattern("hotels:*");
    return hotel;
  }

  /**
   * Generate a unique slug, avoiding collision with existing hotels.
   *
   * Uses a single indexed-friendly query instead of a retry loop so a busy
   * name (e.g. "The Grand" → "-1", "-2", …) never causes N sequential lookups.
   */
  async _generateUniqueSlug(name, excludeId = null) {
    const { slugify } = require("../../utils/slugify");
    const baseSlug = slugify(name);
    const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const slugPattern = new RegExp(`^${escaped}(-\\d+)?$`);

    const query = { slug: slugPattern };
    if (excludeId) query._id = { $ne: excludeId };

    const collisions = await Hotel.find(query).select("slug").lean();

    let slug = baseSlug;
    let maxSuffix = 0;
    for (const doc of collisions) {
      if (doc.slug === baseSlug) {
        maxSuffix = 0; // base name is taken → need a numbered suffix
      } else {
        const match = doc.slug.match(/-(\d+)$/);
        if (match) maxSuffix = Math.max(maxSuffix, parseInt(match[1], 10));
      }
    }

    const baseTaken = collisions.some((doc) => doc.slug === baseSlug);
    if (baseTaken) {
      slug = `${baseSlug}-${maxSuffix + 1}`;
    }

    return slug;
  }
}

module.exports = new HotelService();
