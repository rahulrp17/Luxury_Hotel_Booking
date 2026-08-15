const cron = require("node-cron");
const Booking = require("../modules/bookings/booking.model");
const { BOOKING_STATUS, PENDING_BOOKING_EXPIRY_MS } = require("../config/constants");
const logger = require("../config/logger");

// Global sweep: every 10 minutes, cancel stale PENDING (unpaid) bookings that
// exceed the expiry window so they stop holding room inventory. This runs in
// addition to the on-demand cleanup performed at booking creation.
cron.schedule("*/10 * * * *", async () => {
  const cutoff = new Date(Date.now() - PENDING_BOOKING_EXPIRY_MS);

  try {
    const result = await Booking.updateMany(
      { status: BOOKING_STATUS.PENDING, createdAt: { $lt: cutoff } },
      {
        $set: {
          status: BOOKING_STATUS.CANCELLED,
          cancellationReason:
            "Booking expired - payment not completed within the time limit.",
          cancellationDate: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} stale PENDING booking(s).`);
    }
  } catch (error) {
    logger.error(`Pending-booking expiry job failed: ${error.message}`);
  }
});
