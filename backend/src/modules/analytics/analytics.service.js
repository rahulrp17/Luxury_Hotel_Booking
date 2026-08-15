const User = require("../users/user.model");
const Booking = require("../bookings/booking.model");
const Hotel = require("../hotels/hotel.model");
const Room = require("../rooms/room.model");
const Payment = require("../payments/payment.model");
const { BOOKING_STATUS, PAYMENT_STATUS } = require("../../config/constants");
const { startOfDay } = require("../../utils/dateHelpers");

/**
 * Bookings whose stay was real money: a payment was captured for them.
 * `COMPLETED` was missing from the original filters — the exact reason a fully
 * paid, completed stay showed as ₹0 on the admin dashboard.
 */
const PAID_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.CHECKED_OUT,
  BOOKING_STATUS.COMPLETED,
];

/** Bookings that occupy a room over a date range (used for occupancy). */
const OCCUPANCY_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.CHECKED_OUT,
  BOOKING_STATUS.COMPLETED,
];

// Analytics dates are bucketed in IST (+05:30, no DST) so a day boundary matches
// the admin's local calendar day rather than UTC midnight. `istDateKey` mirrors
// the Mongo `$dateToString` timezone bucket so JS zero-filling lines up exactly.
const IST_TZ = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86400000;
const istDateKey = (ms) => new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);

/** Calendar-day buckets (IST) for the trailing N days, oldest first. */
function lastNDaysIST(n) {
  const now = Date.now();
  const todayStartIST = Math.floor((now + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS;
  const days = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const start = todayStartIST - i * DAY_MS;
    days.push({ key: istDateKey(start), start });
  }
  return days;
}

class AnalyticsService {
  /**
   * Get high-level KPI overview.
   *
   * Revenue is payment-based: only payments that actually captured money count
   * (CAPTURED or REFUNDED — the latter was captured and then fully refunded),
   * and PROCESSED refunds are subtracted. `totalRevenue` is therefore net of
   * refunds (grossRevenue − refundedAmount), which is what "what we kept" means.
   */
  async getOverview() {
    const today = new Date();
    const startOfToday = startOfDay(today);

    const [grossAgg, refundAgg, totalUsers, totalHotels, todayBookings] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: { $in: [PAYMENT_STATUS.CAPTURED, PAYMENT_STATUS.REFUNDED] },
          },
        },
        { $group: { _id: null, gross: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $unwind: "$refunds" },
        { $match: { "refunds.status": "PROCESSED" } },
        { $group: { _id: null, refunded: { $sum: "$refunds.amount" } } },
      ]),
      User.countDocuments({ role: "USER" }),
      Hotel.countDocuments({ isActive: true }),
      Booking.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    const grossRevenue = grossAgg.length ? grossAgg[0].gross : 0;
    const refundedAmount = refundAgg.length ? refundAgg[0].refunded : 0;

    return {
      totalRevenue: grossRevenue - refundedAmount,
      grossRevenue,
      refundedAmount,
      totalUsers,
      totalHotels,
      todayBookings,
    };
  }

  /**
   * Get Revenue Chart Data (last 30 days, inclusive of today, IST-aware).
   *
   * Each day reports `revenue` = captured payments that day minus PROCESSED
   * refunds that day, and `bookingsCount` = every Booking created that day
   * (any status — a booking record exists regardless of payment outcome). The
   * series is zero-filled so the line/bar charts render a continuous window.
   */
  async getRevenueChartData() {
    const days = lastNDaysIST(30);
    const startOfRange = new Date(days[0].start);

    const [grossAgg, refundAgg, bookingAgg] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: { $in: [PAYMENT_STATUS.CAPTURED, PAYMENT_STATUS.REFUNDED] },
            capturedAt: { $gte: startOfRange },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$capturedAt", timezone: IST_TZ } },
            gross: { $sum: "$amount" },
          },
        },
      ]),
      Payment.aggregate([
        { $unwind: "$refunds" },
        {
          $match: {
            "refunds.status": "PROCESSED",
            "refunds.processedAt": { $gte: startOfRange },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$refunds.processedAt", timezone: IST_TZ } },
            refunded: { $sum: "$refunds.amount" },
          },
        },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startOfRange } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: IST_TZ } },
            bookingsCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byDay = new Map(days.map((d) => [d.key, { _id: d.key, revenue: 0, bookingsCount: 0 }]));
    for (const row of grossAgg) {
      const entry = byDay.get(row._id);
      if (entry) entry.revenue += row.gross;
    }
    for (const row of refundAgg) {
      const entry = byDay.get(row._id);
      if (entry) entry.revenue -= row.refunded;
    }
    for (const row of bookingAgg) {
      const entry = byDay.get(row._id);
      if (entry) entry.bookingsCount += row.bookingsCount;
    }

    return Array.from(byDay.values());
  }

  /**
   * Get Occupancy Rate Data (look-ahead 7 days).
   *
   * Booked nights are counted only for the nights actually inside the window
   * (overlap of [checkIn, checkOut) with [today, today+7]), and COMPLETED stays
   * whose checkout is still in the future are counted — so a completed stay that
   * still covers tonight is not silently dropped.
   */
  async getOccupancyData() {
    const today = startOfDay(new Date());
    const endOfRange = new Date(today.getTime() + 7 * DAY_MS);

    const pipeline = [
      {
        $match: {
          checkIn: { $lte: endOfRange },
          checkOut: { $gte: today },
          status: { $in: OCCUPANCY_STATUSES },
        },
      },
      {
        $project: {
          hotel: "$hotel",
          overlapDays: {
            $ceil: {
              $divide: [
                { $subtract: [{ $min: ["$checkOut", endOfRange] }, { $max: ["$checkIn", today] }] },
                DAY_MS,
              ],
            },
          },
        },
      },
      { $match: { overlapDays: { $gt: 0 } } },
      { $group: { _id: "$hotel", bookedNights: { $sum: "$overlapDays" } } },
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      { $unwind: "$hotelDetails" },
      { $project: { hotelName: "$hotelDetails.name", bookedNights: 1 } },
      { $sort: { bookedNights: -1 } },
      { $limit: 10 },
    ];

    return Booking.aggregate(pipeline);
  }

  /**
   * Get Top Hotels by Revenue (net of refunds, payment-based).
   *
   * Matches paid bookings (status CONFIRMED/CHECKED_IN/CHECKED_OUT/COMPLETED)
   * that have an actual captured payment, then subtracts PROCESSED refunds per
   * hotel so the sum is consistent with the overview's net revenue.
   */
  async getTopHotels() {
    const pipeline = [
      { $match: { status: { $in: PAID_BOOKING_STATUSES } } },
      {
        $lookup: {
          from: "payments",
          localField: "payment",
          foreignField: "_id",
          as: "payment",
        },
      },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      { $match: { "payment.status": { $in: [PAYMENT_STATUS.CAPTURED, PAYMENT_STATUS.REFUNDED] } } },
      {
        $project: {
          hotel: "$hotel",
          amount: { $ifNull: ["$payment.amount", "$pricing.totalAmount"] },
          refunded: {
            $reduce: {
              input: {
                $filter: {
                  input: { $ifNull: ["$payment.refunds", []] },
                  as: "r",
                  cond: { $eq: ["$$r.status", "PROCESSED"] },
                },
              },
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.amount", 0] }] },
            },
          },
        },
      },
      {
        $group: {
          _id: "$hotel",
          gross: { $sum: "$amount" },
          refunded: { $sum: "$refunded" },
          bookings: { $sum: 1 },
        },
      },
      {
        $project: {
          revenue: { $subtract: ["$gross", "$refunded"] },
          bookings: 1,
        },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      { $unwind: "$hotelDetails" },
      { $project: { hotelName: "$hotelDetails.name", revenue: 1, bookings: 1 } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ];

    return Booking.aggregate(pipeline);
  }

  /**
   * Booking summary for the admin dashboard: total/pending counts, a status
   * breakdown for the donut (all seven statuses, COMPLETED included), and a
   * look-ahead occupancy rate derived from real room inventory (`totalUnits`
   * across active rooms × 7 nights) vs nights booked in the coming week.
   */
  async getBookingSummary() {
    const today = startOfDay(new Date());
    const endOfRange = new Date(today.getTime() + 7 * DAY_MS);

    const [statusAgg, bookedNightsAgg, unitsAgg] = await Promise.all([
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.aggregate([
        {
          $match: {
            checkIn: { $lte: endOfRange },
            checkOut: { $gte: today },
            status: { $in: OCCUPANCY_STATUSES },
          },
        },
        {
          $project: {
            overlapDays: {
              $ceil: {
                $divide: [
                  { $subtract: [{ $min: ["$checkOut", endOfRange] }, { $max: ["$checkIn", today] }] },
                  DAY_MS,
                ],
              },
            },
          },
        },
        { $match: { overlapDays: { $gt: 0 } } },
        { $group: { _id: null, bookedNights: { $sum: "$overlapDays" } } },
      ]),
      Room.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalUnits: { $sum: "$totalUnits" } } },
      ]),
    ]);

    const statusCounts = Object.fromEntries(
      Object.values(BOOKING_STATUS).map((s) => [s, 0])
    );
    let totalBookings = 0;
    for (const entry of statusAgg) {
      statusCounts[entry._id] = entry.count;
      totalBookings += entry.count;
    }

    const capacityNights = Math.max(1, (unitsAgg.length ? unitsAgg[0].totalUnits : 0) * 7);
    const bookedNights = bookedNightsAgg.length ? bookedNightsAgg[0].bookedNights : 0;
    const occupancyRate = Math.min(100, Math.round((bookedNights / capacityNights) * 100));

    return {
      totalBookings,
      pendingBookings: statusCounts.PENDING,
      occupancyRate,
      statusCounts,
      confirmedBookings: statusCounts.CONFIRMED,
      checkedInBookings: statusCounts.CHECKED_IN,
      checkedOutBookings: statusCounts.CHECKED_OUT,
      completedBookings: statusCounts.COMPLETED,
      cancelledBookings: statusCounts.CANCELLED,
      refundedBookings: statusCounts.REFUNDED,
    };
  }
}

module.exports = new AnalyticsService();
