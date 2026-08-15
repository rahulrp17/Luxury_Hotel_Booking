const mongoose = require("mongoose");
const Booking = require("./booking.model");
const Room = require("../rooms/room.model");
const Offer = require("../offers/offer.model");
const Addon = require("../addons/addon.model");
const offerService = require("../offers/offer.service");
const ApiError = require("../../utils/ApiError");
const availabilityService = require("../../services/availability.service");
const pricingService = require("../../services/pricing.service");
const paymentService = require("../payments/payment.service");
const { generateBookingId } = require("../../utils/slugify");
const { BOOKING_STATUS, PAYMENT_STATUS } = require("../../config/constants");
const { isCancellationAllowed, isPastDate } = require("../../utils/dateHelpers");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const logger = require("../../config/logger");
const { invalidateAnalyticsCache } = require("../analytics/analytics.cache");

class BookingService {
  /**
   * Create a new booking (PENDING status)
   */
  /**
   * Create a new booking (PENDING status) with an atomic reservation.
   * Uses a MongoDB transaction so the availability check + booking insert are
   * atomic (prevents overselling). Requires a replica set; on standalone/dev it
   * falls back to non-transactional creation.
   */
  async createBooking(userId, data) {
    let session;
    try {
      session = await mongoose.startSession();
      return await session.withTransaction(() =>
        this._createBookingCore(userId, data, session)
      );
    } catch (err) {
      if (this._isTransactionUnsupported(err)) {
        logger.warn(
          "Mongo transactions unavailable (replica set required); booking created without atomicity."
        );
        return this._createBookingCore(userId, data, null);
      }
      throw err;
    } finally {
      if (session) await session.endSession();
    }
  }

  /**
   * Detect whether an error is caused by running a transaction on a
   * non-replica-set (standalone) MongoDB deployment.
   */
  _isTransactionUnsupported(err) {
    const msg = (err && err.message) || "";
    return /transaction/i.test(msg) || /replica set/i.test(msg);
  }

  /**
   * Core booking creation logic. `session` is threaded to the reservation
   * queries (expiry, availability check, insert) when a transaction is active.
   */
  async _createBookingCore(userId, data, session) {
    const { hotel, room, checkIn, checkOut, guests, addons, offerCode, specialRequests, guestDetails } = data;

    // Load the room first so ownership/capacity/pricing are validated authoritatively
    const roomDoc = await Room.findById(room);
    if (!roomDoc || !roomDoc.isActive) {
      throw ApiError.notFound("Room not found.");
    }

    // V1: The room must belong to the requested hotel (prevents cross-hotel booking)
    if (roomDoc.hotel.toString() !== String(hotel)) {
      throw ApiError.badRequest("The selected room does not belong to the selected hotel.");
    }

    // V3: Check-in cannot be in the past
    if (isPastDate(checkIn)) {
      throw ApiError.badRequest("Check-in date cannot be in the past.");
    }

    // Check capacity
    if (guests.adults > roomDoc.maxOccupancy.adults || guests.children > roomDoc.maxOccupancy.children) {
      throw ApiError.badRequest("Number of guests exceeds room capacity.");
    }

    // V2: Resolve addons against the server-side catalog. The client only
    // supplies { code, quantity }; prices come from the catalog, so a client
    // cannot manipulate the booking total via addon pricing.
    const sanitizedAddons = [];
    if (addons && addons.length) {
      const codes = addons
        .map((a) => String(a.code || "").toUpperCase().trim())
        .filter(Boolean);
      const catalog = await Addon.find({ code: { $in: codes }, isActive: true }).lean();
      const byCode = new Map(catalog.map((a) => [a.code, a]));

      for (const addon of addons) {
        const code = String(addon.code || "").toUpperCase().trim();
        if (!code) {
          throw ApiError.badRequest("Each addon must include a code.");
        }
        const item = byCode.get(code);
        if (!item) {
          throw ApiError.badRequest(`Unknown or inactive addon code: ${code}`);
        }
        sanitizedAddons.push({
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: Math.max(1, Math.round(Number(addon.quantity) || 1)),
        });
      }
    }

    // B7: Expire stale PENDING (unpaid) bookings for this room so they don't
    // permanently hold inventory before we re-check availability.
    await availabilityService.expireStalePendingBookings(room, undefined, session);

    // 1. Verify availability (atomic-like check before creating)
    const isAvailable = await availabilityService.isRoomAvailable(room, checkIn, checkOut, null, session, roomDoc);
    if (!isAvailable) {
      throw ApiError.conflict("Room is no longer available for the selected dates.");
    }

    // 2. Validate Offer (if provided)
    let offer = null;
    let discountAmount = 0;
    if (offerCode) {
      offer = await Offer.findOne({ code: offerCode.toUpperCase() });
      if (!offer || !offer.isValid) {
        throw ApiError.badRequest("Invalid or expired offer code.");
      }

      // Enforce per-user usage limit (default 1 in the Offer schema)
      if (offer.perUserLimit) {
        const userOfferUses = await Booking.countDocuments({
          user: userId,
          offerCode: offer.code,
          status: { $ne: BOOKING_STATUS.CANCELLED },
        });
        if (userOfferUses >= offer.perUserLimit) {
          throw ApiError.badRequest("You have already used this offer code.");
        }
      }

      // Calculate provisional base amount for offer validation
      const tempPricing = pricingService.calculateBookingPrice(roomDoc, checkIn, checkOut, sanitizedAddons, 0);
      discountAmount = pricingService.calculateOfferDiscount(offer, tempPricing.baseAmount);
    }

    // 3. Calculate final pricing
    const pricing = pricingService.calculateBookingPrice(roomDoc, checkIn, checkOut, sanitizedAddons, discountAmount);

    // 4. Generate Booking ID
    const bookingId = generateBookingId();

    // 5. Create Booking. Only pass `{ session }` when a transaction is actually
    // active. In Mongoose 8, `Model.create(doc, { session })` REQUIRES the doc
    // as an array — passing a single object causes it to treat the object as
    // create options, silently insert an empty document and throw a
    // ValidationError. On the non-transaction path we call `create` with one
    // argument so the plain object is used as-is.
    const bookingDoc = {
      bookingId,
      user: userId,
      hotel,
      room,
      checkIn,
      checkOut,
      nights: pricing.nights,
      guests,
      addons: sanitizedAddons,
      pricing,
      offer: offer ? offer._id : undefined,
      offerCode: offer ? offer.code : undefined,
      specialRequests,
      guestDetails,
      status: BOOKING_STATUS.PENDING,
    };
    const booking = session
      ? (await Booking.create([bookingDoc], { session }))[0]
      : await Booking.create(bookingDoc);

    // Note: Availability count is NOT reduced here. It's reduced upon payment confirmation.

    // Track offer usage (never blocks the booking on failure)
    if (offer) {
      await offerService
        .incrementUsage(offer._id)
        .catch((err) =>
          logger.warn(`Failed to increment usage for offer ${offer.code}: ${err.message}`)
        );
    }

    return booking;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { user: userId };

    if (query.status) {
      filter.status = query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("hotel", "name images slug address")
        .populate("room", "name type images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Get booking by ID (with authorization check)
   */
  async getBookingById(bookingId, userId, isAdmin = false) {
    const booking = await Booking.findById(bookingId)
      .populate("hotel", "name images slug address policies contact")
      .populate("room", "name type amenities images")
      .populate("user", "name email phone")
      .populate("payment")
      .lean();

    if (!booking) {
      throw ApiError.notFound("Booking not found.");
    }

    // Verify ownership if not admin (guard a deleted/de-synced user reference)
    if (!isAdmin && (!booking.user || booking.user._id.toString() !== userId.toString())) {
      throw ApiError.forbidden("Access denied.");
    }

    return booking;
  }

  /**
   * Cancel booking (by user)
   *
   * Refund-first: for a paid (CAPTURED) booking the gateway refund is attempted
   * BEFORE the booking is cancelled. Only a gateway-accepted refund lets a paid
   * booking be cancelled — on failure the booking stays CONFIRMED and the caller
   * receives a client-safe error. Unpaid/PENDING bookings cancel as before.
   */
  async cancelBooking(bookingId, userId, reason) {
    const booking = await Booking.findById(bookingId).populate("payment");

    if (!booking) throw ApiError.notFound("Booking not found.");

    if (booking.user.toString() !== userId.toString()) {
      throw ApiError.forbidden("Access denied.");
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw ApiError.badRequest("Booking is already cancelled.");
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.PENDING) {
      throw ApiError.badRequest(`Cannot cancel booking in ${booking.status} status.`);
    }

    // Cancellation policy (existing): full refund within the deadline (24h
    // before check-in); after it, one night's price is deducted as a
    // late-cancellation penalty and only the remainder is refunded.
    const isAllowed = isCancellationAllowed(booking.checkIn);
    let refundAmount = 0;
    if (booking.status === BOOKING_STATUS.CONFIRMED) {
       if (isAllowed) {
         refundAmount = booking.pricing.totalAmount; // Full refund
       } else {
         // Deduct 1 actual night's price (pre-tax) as a late-cancellation penalty
         const room = await Room.findById(booking.room);
         const oneNightPrice = room
           ? pricingService.getPriceForDate(room, booking.checkIn)
           : booking.pricing.baseAmount / booking.nights;
         refundAmount = Math.max(0, booking.pricing.totalAmount - oneNightPrice);
       }
    }

    const payment = booking.payment;
    const needsGatewayRefund =
      refundAmount > 0 &&
      payment &&
      payment.status === PAYMENT_STATUS.CAPTURED;

    // Refund FIRST. A paid booking is only cancelled once the gateway accepts
    // the refund; on rejection the booking stays CONFIRMED (no false success).
    let refund = null;
    let fullyRefunded = false;
    if (needsGatewayRefund) {
      try {
        const updatedPayment = await paymentService.initiateRefund(
          payment._id,
          refundAmount,
          reason || "Booking cancelled by user"
        );
        // A full refund flips Payment → REFUNDED (and Booking → REFUNDED inside
        // initiateRefund); a partial refund keeps the payment CAPTURED.
        fullyRefunded = updatedPayment?.status === PAYMENT_STATUS.REFUNDED;
        const lastRefund = updatedPayment?.refunds?.[updatedPayment.refunds.length - 1];
        refund = {
          initiated: true,
          refundId: lastRefund?.refundId,
          amount: lastRefund?.amount ?? refundAmount,
          currency: updatedPayment?.currency || "INR",
          status: lastRefund?.status || "PROCESSED",
        };
      } catch (err) {
        // A client-safe failure (e.g. "refund already initiated") is passed
        // through as-is; gateway errors are masked with a safe message. The
        // booking is deliberately left active (status unchanged in the DB).
        logger.error(
          `Cancellation blocked for booking ${booking.bookingId}: refund not accepted by gateway. ${err.message}`
        );
        if (err instanceof ApiError && err.statusCode < 500) {
          throw err;
        }
        throw ApiError.internal(
          "Your booking was not cancelled because the refund could not be processed. Please try again."
        );
      }
    }

    if (fullyRefunded) {
      // Mirror the REFUNDED status initiateRefund already wrote to the DB so
      // this save() does not overwrite it with a stale CONFIRMED.
      booking.status = BOOKING_STATUS.REFUNDED;
    } else {
      booking.status = BOOKING_STATUS.CANCELLED;
    }
    booking.cancellationReason = reason;
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;

    await booking.save();

    // Booking status + (possibly) a refund changed — refresh the dashboard KPIs.
    await invalidateAnalyticsCache();

    return { booking, refund };
  }

  /**
   * Admin: Get all bookings
   */
  async getAllBookings(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.hotelId) filter.hotel = query.hotelId;
    if (query.bookingId) filter.bookingId = new RegExp(escapeRegex(query.bookingId), "i");

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("hotel", "name")
        .populate("room", "name")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Admin: Update booking status
   */
  async updateBookingStatus(bookingId, status) {
    if (!Object.values(BOOKING_STATUS).includes(status)) {
      throw ApiError.badRequest("Invalid booking status.");
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) throw ApiError.notFound("Booking not found.");

    // Status breakdown on the dashboard changed — drop the cached analytics.
    await invalidateAnalyticsCache();
    return booking;
  }
}

module.exports = new BookingService();
