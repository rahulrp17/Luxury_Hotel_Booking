/**
 * Worker entrypoint.
 *
 * Requiring this module registers all background job processors and cron
 * schedules that keep the platform running in the background:
 *   - Bull processors: emailQueue / smsQueue (emailJob, smsJob)
 *   - node-cron: booking check-in reminders (bookingReminderJob)
 *   - node-cron: stale PENDING booking expiry sweep (expirePendingBookingsJob)
 *
 * It is required once from server.js after the DB connection is established so
 * it runs in the same process as the API (fine for a single-process deploy).
 * For horizontal scale, run this module as a dedicated worker process instead.
 */
require("./emailJob");
require("./smsJob");
require("./bookingReminderJob");
require("./expirePendingBookingsJob");
