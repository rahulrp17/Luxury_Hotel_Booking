const Room = require("./room.model");
const Hotel = require("../hotels/hotel.model");
const Booking = require("../bookings/booking.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { deleteFromCloudinary } = require("../../config/cloudinary");
const { deleteCacheByPattern } = require("../../config/redis");
const availabilityService = require("../../services/availability.service");
const pricingService = require("../../services/pricing.service");
const { BOOKING_STATUS } = require("../../config/constants");

/** Reused INR formatter — constructed once, not per room (perf). */
const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Payload projection for the public room endpoints (keeps responses slim). */
const ROOM_PROJECTION = {
  name: 1,
  type: 1,
  description: 1,
  view: 1,
  size: 1,
  bedConfiguration: 1,
  amenities: 1,
  images: 1,
  basePricePerNight: 1,
  weekendPremium: 1,
  totalUnits: 1,
  maxOccupancy: 1,
  isFeatured: 1,
  hotel: 1,
  createdAt: 1,
};

class RoomService {
  async getRoomsByHotel(hotelId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { hotel: hotelId, isActive: true };

    if (query.type) filter.type = query.type;
    if (query.minPrice) filter.basePricePerNight = { $gte: parseInt(query.minPrice) };
    if (query.maxPrice) {
      filter.basePricePerNight = { ...filter.basePricePerNight, $lte: parseInt(query.maxPrice) };
    }
    if (query.adults) filter["maxOccupancy.adults"] = { $gte: parseInt(query.adults) };

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .select(ROOM_PROJECTION)
        .sort({ basePricePerNight: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Room.countDocuments(filter),
    ]);

    return {
      rooms,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * GET /rooms/featured — public list of featured + active rooms.
   *
   * Returns a "card shape" aligned to the frontend FeaturedRooms.jsx RoomCard,
   * which reads room.image / room.price (raw string) / room.hotel (string name)
   * / room.guests / room.size / room.rating. The hotel name is inlined and a
   * formatted `price` is derived so the Home cards render with zero frontend
   * changes. Underlying fields are preserved for backward compatibility.
   */
  async getFeaturedRooms(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isFeatured: true, isActive: true };

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .select(ROOM_PROJECTION)
        .populate("hotel", "_id name slug avgRating")
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Room.countDocuments(filter),
    ]);

    return {
      rooms: this._attachCardShape(rooms),
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * GET /rooms — public, filterable, sortable, paginated room listing.
   */
  async getRooms(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = await this._buildRoomFilter(query);
    const sort = query.sort;

    // rating / popular sorts need cross-document data → aggregation path
    if (sort === "rating" || sort === "popular") {
      return this._getRoomsAggregated(filter, { page, limit, skip }, sort, query);
    }

    if (query.available === "true" && query.checkIn && query.checkOut) {
      const ids = await this._narrowByAvailability(filter, query.checkIn, query.checkOut);
      if (ids.length === 0) {
        return { rooms: [], pagination: buildPagination(page, limit, 0) };
      }
      filter._id = { $in: ids };
    }

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .select(ROOM_PROJECTION)
        .populate("hotel", "name slug")
        .sort(this._buildRoomSort(sort))
        .skip(skip)
        .limit(limit)
        .lean(),
      Room.countDocuments(filter),
    ]);

    return {
      rooms: this._attachPrimaryImage(rooms),
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Build the Mongo filter from validated query params (active rooms only).
   */
  async _buildRoomFilter(query) {
    const filter = { isActive: true };

    let categoryHotelIds = null;
    if (query.category) {
      const hotels = await Hotel.find({ isActive: true, category: query.category })
        .select("_id")
        .lean();
      categoryHotelIds = hotels.map((h) => h._id);
    }

    if (query.hotelId) {
      filter.hotel = query.hotelId;
      if (categoryHotelIds) {
        filter.$and = [{ hotel: query.hotelId }, { hotel: { $in: categoryHotelIds } }];
        delete filter.hotel;
      }
    } else if (categoryHotelIds) {
      filter.hotel = { $in: categoryHotelIds };
    }

    if (query.type) filter.type = query.type;

    const price = {};
    if (query.minPrice !== undefined) price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice !== undefined) price.$lte = parseFloat(query.maxPrice);
    if (Object.keys(price).length) filter.basePricePerNight = price;

    const capacity = query.capacity !== undefined ? parseInt(query.capacity) : 0;
    const beds = query.beds !== undefined ? parseInt(query.beds) : 0;
    if (capacity || beds) {
      filter["maxOccupancy.adults"] = { $gte: Math.max(capacity, beds) };
    }

    if (query.featured === "true") filter.isFeatured = true;

    if (query.amenities) {
      const list = query.amenities.split(",").map((s) => s.trim()).filter(Boolean);
      if (list.length) filter.amenities = { $all: list };
    }

    return filter;
  }

  /**
   * Map a sort key to a Mongo sort object.
   */
  _buildRoomSort(sort) {
    switch (sort) {
      case "price_asc":
        return { basePricePerNight: 1 };
      case "price_desc":
        return { basePricePerNight: -1 };
      case "featured":
        return { isFeatured: -1, createdAt: -1 };
      default:
        return { createdAt: -1 }; // newest
    }
  }

  /**
   * Narrow a room filter to those with at least one free unit for the dates.
   */
  async _narrowByAvailability(filter, checkIn, checkOut) {
    const rooms = await Room.find(filter).select("_id totalUnits").lean();
    if (rooms.length === 0) return [];

    const roomIds = rooms.map((r) => r._id);
    const overlaps = await Booking.aggregate([
      {
        $match: {
          room: { $in: roomIds },
          status: {
            $in: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.PENDING,
            ],
          },
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) },
        },
      },
      { $group: { _id: "$room", count: { $sum: 1 } } },
    ]);

    const counts = new Map(overlaps.map((o) => [o._id.toString(), o.count]));
    return rooms
      .filter((r) => (counts.get(r._id.toString()) || 0) < r.totalUnits)
      .map((r) => r._id);
  }

  /**
   * Aggregation path for rating / popular sorts (joins hotels + bookings).
   */
  async _getRoomsAggregated(filter, { page, limit, skip }, sort, query) {
    if (query.available === "true" && query.checkIn && query.checkOut) {
      const ids = await this._narrowByAvailability(filter, query.checkIn, query.checkOut);
      if (ids.length === 0) {
        return { rooms: [], pagination: buildPagination(page, limit, 0) };
      }
      filter._id = { $in: ids };
    }

    const pipeline = [
      { $match: filter },
      { $lookup: { from: "hotels", localField: "hotel", foreignField: "_id", as: "hotelDoc" } },
      { $unwind: { path: "$hotelDoc", preserveNullAndEmptyArrays: true } },
    ];

    if (sort === "rating") {
      pipeline.push({ $sort: { "hotelDoc.avgRating": -1, createdAt: -1 } });
    } else {
      pipeline.push(
        {
          $lookup: {
            from: "bookings",
            let: { roomId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$room", "$$roomId"] },
                      {
                        $in: [
                          "$status",
                          [
                            BOOKING_STATUS.CONFIRMED,
                            BOOKING_STATUS.CHECKED_IN,
                            BOOKING_STATUS.CHECKED_OUT,
                          ],
                        ],
                      },
                    ],
                  },
                },
              },
              { $count: "count" },
            ],
            as: "bookingStats",
          },
        },
        {
          $addFields: {
            popularity: { $ifNull: [{ $arrayElemAt: ["$bookingStats.count", 0] }, 0] },
          },
        },
        { $sort: { popularity: -1, createdAt: -1 } }
      );
    }

    pipeline.push(
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          type: 1,
          description: 1,
          view: 1,
          size: 1,
          bedConfiguration: 1,
          amenities: 1,
          images: 1,
          basePricePerNight: 1,
          weekendPremium: 1,
          totalUnits: 1,
          maxOccupancy: 1,
          isFeatured: 1,
          createdAt: 1,
          hotel: { name: "$hotelDoc.name", slug: "$hotelDoc.slug" },
        },
      }
    );

    const [rooms, total] = await Promise.all([
      Room.aggregate(pipeline),
      Room.countDocuments(filter),
    ]);

    return {
      rooms: this._attachPrimaryImage(rooms),
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Derive `primaryImage` from images[0] on lean results.
   */
  _attachPrimaryImage(rooms) {
    return (rooms || []).map((room) => ({
      ...room,
      primaryImage: room.images?.[0] || null,
    }));
  }

  /**
   * Map a room to the featured-room "card card" shape consumed by the Home
   * FeaturedRooms.jsx RoomCard: image, price (raw INR string), hotel (name),
   * guests, size, rating. Used by GET /rooms/featured.
   */
  _attachCardShape(rooms) {
    return (rooms || []).map((room) => {
      const primary = room.images?.[0] || null;
      const capacity = room.maxOccupancy || {};
      const capacityTotal = (capacity.adults || 0) + (capacity.children || 0);
      return {
        ...room,
        image: primary?.url || null,
        primaryImage: primary,
        price: this._formatINR(room.basePricePerNight),
        rating: room.hotel?.avgRating || 5,
        hotel: room.hotel?.name || "",
        hotelId: room.hotel?._id || null,
        guests: capacityTotal || capacity.adults || 1,
        size: room.size ? String(room.size) : room.size,
      };
    });
  }

  /** Format an amount as an Indian-Rupee string (e.g. ₹24,999) — no decimals. */
  _formatINR(amount) {
    const value = Number(amount) || 0;
    try {
      return INR_FORMATTER.format(value);
    } catch {
      return `₹${value.toLocaleString("en-IN")}`;
    }
  }

  async getRoomById(id) {
    const room = await Room.findById(id).populate("hotel", "name slug address policies").lean();
    if (!room || !room.isActive) {
      throw ApiError.notFound("Room not found.");
    }
    return room;
  }

  async getRoomAvailability(roomId, checkIn, checkOut) {
    if (!checkIn || !checkOut) {
      throw ApiError.badRequest("Check-in and check-out dates are required.");
    }
    // Fetch the room once and reuse it for both the availability check and the
    // pricing breakdown — avoids loading the same document twice per request.
    const room = await Room.findById(roomId).select(
      "totalUnits basePricePerNight seasonalPricing weekendPremium isActive"
    );
    const availability = await availabilityService.getRoomAvailability(roomId, checkIn, checkOut, room);
    if (room) {
      const pricing = pricingService.calculateBookingPrice(room, checkIn, checkOut);
      return { ...availability, pricing };
    }
    return availability;
  }

  async getBlockedDates(roomId, startDate, endDate) {
    if (!startDate || !endDate) {
      throw ApiError.badRequest("startDate and endDate query parameters are required.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw ApiError.badRequest("Invalid startDate/endDate.");
    }
    if (end <= start) {
      throw ApiError.badRequest("endDate must be after startDate.");
    }

    const MAX_RANGE_DAYS = 120;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days > MAX_RANGE_DAYS) {
      throw ApiError.badRequest(`Date range cannot exceed ${MAX_RANGE_DAYS} days.`);
    }

    return availabilityService.getBlockedDates(roomId, startDate, endDate);
  }

  async _invalidateCache(hotelId = null) {
    await Promise.all([
      deleteCacheByPattern("rooms:list*"),
      deleteCacheByPattern("rooms:featured*"),
      deleteCacheByPattern("rooms:hotel:*"),
      hotelId ? deleteCacheByPattern(`hotel:${hotelId}*`) : Promise.resolve(),
    ]);
  }

  async createRoom(data) {
    const room = await Room.create(data);
    await this._invalidateCache(data.hotel);
    return room;
  }

  async updateRoom(id, data) {
    // Only allow explicit, non-authoritative fields through. Prevents a caller
    // from reassigning hotel, images, isActive, _id, etc.
    const allowedFields = [
      "name", "type", "description", "maxOccupancy", "size", "floor",
      "bedConfiguration", "view", "amenities", "basePricePerNight",
      "weekendPremium", "seasonalPricing", "totalUnits", "isFeatured",
    ];
    const updateData = {};
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) updateData[key] = data[key];
    }

    const room = await Room.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!room) throw ApiError.notFound("Room not found.");
    await this._invalidateCache(room.hotel?.toString());
    return room;
  }

  async deleteRoom(id) {
    const room = await Room.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!room) throw ApiError.notFound("Room not found.");
    await this._invalidateCache(room.hotel?.toString());
    return room;
  }

  async addRoomImages(id, files) {
    const room = await Room.findById(id);
    if (!room) throw ApiError.notFound("Room not found.");

    const newImages = files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    room.images.push(...newImages);
    await room.save();
    await this._invalidateCache(room.hotel?.toString());
    return room;
  }

  async removeRoomImage(id, imageId) {
    const room = await Room.findById(id);

    if (!room) {
      throw ApiError.notFound("Room not found.");
    }

    const imageIndex = room.images.findIndex(
      (image) => image.publicId === imageId
    );

    if (imageIndex === -1) {
      throw ApiError.notFound("Room image not found.");
    }

    const image = room.images[imageIndex];

    // Delete image from Cloudinary
    if (image.publicId) {
      try {
        await deleteFromCloudinary(image.publicId);
      } catch (error) {
        console.error(
          `Failed to delete Cloudinary image ${image.publicId}:`,
          error
        );

        // We don't stop the database deletion if Cloudinary deletion fails.
      }
    }

    // Remove image from MongoDB
    room.images.splice(imageIndex, 1);

    await room.save();

    await this._invalidateCache(room.hotel?.toString());

    return room;
  }

}

module.exports = new RoomService();
