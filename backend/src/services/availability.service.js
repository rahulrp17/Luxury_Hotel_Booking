const Room = require("../modules/rooms/room.model");
const Booking = require("../modules/bookings/booking.model");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { BOOKING_STATUS, PENDING_BOOKING_EXPIRY_MS } = require("../config/constants");
const { getDateRange } = require("../utils/dateHelpers");

/**
 * Availability Service
 * Manages room availability checking using the Bookings collection
 */
class AvailabilityService {
  /**
   * Check if a room is available for given date range
   * @returns {boolean}
   */
  async isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId = null, session = null, roomDoc = null) {
    // Reuse a caller-provided room document when available (booking creation
    // already loaded it) — avoids a redundant second query in the request path.
    const room = roomDoc || (await Room.findById(roomId));
    if (!room || !room.isActive) {
      throw ApiError.notFound("Room not found or not available.");
    }

    const conflictingBookings = await this._getConflictingBookings(
      roomId,
      checkIn,
      checkOut,
      excludeBookingId,
      session
    );

    const bookedCount = conflictingBookings.length;
    return bookedCount < room.totalUnits;
  }

  /**
   * Get availability details for a room over a date range
   */
  async getRoomAvailability(roomId, checkIn, checkOut, room = null) {
    const roomDoc =
      room ||
      (await Room.findById(roomId).select(
        "totalUnits basePricePerNight seasonalPricing weekendPremium isActive"
      ));

    if (!roomDoc || !roomDoc.isActive) {
      throw ApiError.notFound("Room not found.");
    }

    const conflictingBookings = await this._getConflictingBookings(roomId, checkIn, checkOut);
    const bookedUnits = conflictingBookings.length;
    const availableUnits = roomDoc.totalUnits - bookedUnits;

    return {
      roomId,
      totalUnits: roomDoc.totalUnits,
      bookedUnits,
      availableUnits,
      isAvailable: availableUnits > 0,
      checkIn,
      checkOut,
    };
  }

  /**
   * Get available rooms for a hotel given dates and guest count
   */
  async getAvailableRoomsForHotel(hotelId, checkIn, checkOut, adults = 1, children = 0) {
    const rooms = await Room.find({ hotel: hotelId, isActive: true }).lean();

    if (rooms.length === 0) return [];

    const roomIds = rooms.map((r) => r._id);

    // Single aggregation: count overlapping non-cancelled bookings per room
    // (replaces the previous per-room query — one DB round trip instead of N)
    const overlapCounts = await Booking.aggregate([
      {
        $match: {
          room: { $in: roomIds },
          status: {
            $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.PENDING],
          },
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) },
        },
      },
      { $group: { _id: "$room", count: { $sum: 1 } } },
    ]);

    const counts = new Map(overlapCounts.map((c) => [c._id.toString(), c.count]));

    return rooms
      .filter(
        (room) =>
          room.maxOccupancy.adults >= adults &&
          room.maxOccupancy.children >= children &&
          (counts.get(room._id.toString()) || 0) < room.totalUnits
      )
      .map((room) => ({
        ...room,
        availableUnits: room.totalUnits - (counts.get(room._id.toString()) || 0),
      }));
  }

  /**
   * Get blocked dates for a room (dates where all units are booked)
   * Returns array of date strings
   */
  async getBlockedDates(roomId, startDate, endDate) {
    const room = await Room.findById(roomId).select("totalUnits");
    if (!room) throw ApiError.notFound("Room not found.");

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = getDateRange(startDate, endDate);

    // Single query: fetch all overlapping non-cancelled bookings for the range
    // once, then compute per-date occupancy in memory (replaces per-date count).
    const bookings = await Booking.find({
      room: roomId,
      status: {
        $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.PENDING],
      },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    })
      .select("checkIn checkOut")
      .lean();

    const blockedDates = [];
    for (const date of dates) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const conflicting = bookings.filter((b) => {
        const bIn = new Date(b.checkIn);
        const bOut = new Date(b.checkOut);
        return bIn < nextDay && bOut > date;
      }).length;

      if (conflicting >= room.totalUnits) {
        blockedDates.push(date.toISOString().split("T")[0]);
      }
    }

    return blockedDates;
  }

  /**
   * Cancel stale PENDING (unpaid) bookings for a room so they stop holding
   * inventory. Called before an availability check; a global sweep job can
   * reuse the same helper.
   * @returns {number} number of bookings expired
   */
  async expireStalePendingBookings(roomId, maxAgeMs = PENDING_BOOKING_EXPIRY_MS, session = null) {
    const cutoff = new Date(Date.now() - maxAgeMs);

    let q = Booking.updateMany(
      {
        room: roomId,
        status: BOOKING_STATUS.PENDING,
        createdAt: { $lt: cutoff },
      },
      {
        $set: {
          status: BOOKING_STATUS.CANCELLED,
          cancellationReason: "Booking expired - payment not completed within the time limit.",
          cancellationDate: new Date(),
        },
      }
    );
    if (session) q = q.session(session);
    const result = await q;

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} stale PENDING booking(s) for room ${roomId}`);
    }
    return result.modifiedCount;
  }

  /**
   * Internal: find bookings that overlap with date range
   */
  async _getConflictingBookings(roomId, checkIn, checkOut, excludeBookingId = null, session = null) {
    const query = {
      room: roomId,
      status: {
        $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.PENDING],
      },
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    let q = Booking.find(query).select("_id");
    if (session) q = q.session(session);
    return q.lean();
  }
}

module.exports = new AvailabilityService();
