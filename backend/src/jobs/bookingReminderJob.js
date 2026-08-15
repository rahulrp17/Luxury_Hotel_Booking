const cron = require("node-cron");
const Booking = require("../modules/bookings/booking.model");
const { smsQueue } = require("../services/queue.service");
const { BOOKING_STATUS } = require("../config/constants");
const logger = require("../config/logger");

// Run every hour to check for upcoming bookings
cron.schedule("0 * * * *", async () => {
  logger.info("Running booking reminder job...");

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find bookings checking in tomorrow where reminder hasn't been sent
    const bookings = await Booking.find({
      status: BOOKING_STATUS.CONFIRMED,
      checkIn: {
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lte: new Date(tomorrow.setHours(23, 59, 59, 999)),
      },
      reminderSent: false,
    }).populate("user");

    for (const booking of bookings) {
      // Queue SMS reminder
      if (booking.user.phone) {
        smsQueue.add({
          type: "CHECK_IN_REMINDER",
          data: { user: booking.user, booking },
        });
      }
    }

    // Mark reminderSent for every matched booking with a single write instead
    // of one `save()` round-trip per booking (avoids the N+1 write pattern).
    const matchedIds = bookings.map((b) => b._id);
    if (matchedIds.length > 0) {
      await Booking.updateMany({ _id: { $in: matchedIds } }, { reminderSent: true });
    }

    if (bookings.length > 0) {
      logger.info(`Queued check-in reminders for ${bookings.length} bookings.`);
    }
  } catch (error) {
    logger.error(`Booking reminder job failed: ${error.message}`);
  }
});
