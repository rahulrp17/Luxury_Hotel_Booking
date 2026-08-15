const { smsQueue } = require("../services/queue.service");
const smsService = require("../modules/notifications/sms.service");
const logger = require("../config/logger");

smsQueue.process(async (job) => {
  const { type, data } = job.data;
  
  try {
    switch (type) {
      case "BOOKING_CONFIRMATION":
        await smsService.sendBookingConfirmation(data.user, data.booking);
        break;
      case "CHECK_IN_REMINDER":
        await smsService.sendCheckInReminder(data.user, data.booking);
        break;
      default:
        logger.warn(`Unknown SMS job type: ${type}`);
    }
  } catch (error) {
    logger.error(`SMS job failed: ${error.message}`);
    throw error;
  }
});
