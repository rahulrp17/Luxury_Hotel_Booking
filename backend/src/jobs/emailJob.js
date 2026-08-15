const { emailQueue } = require("../services/queue.service");
const emailService = require("../modules/notifications/email.service");
const logger = require("../config/logger");

emailQueue.process(async (job) => {
  const { type, data } = job.data;
  
  try {
    switch (type) {
      case "WELCOME":
        await emailService.sendWelcomeEmail(data.user, data.token);
        break;
      case "BOOKING_CONFIRMATION":
        await emailService.sendBookingConfirmation(data.user, data.booking);
        break;
      case "PASSWORD_RESET":
        await emailService.sendPasswordResetEmail(data.user, data.token);
        break;
      default:
        logger.warn(`Unknown email job type: ${type}`);
    }
  } catch (error) {
    logger.error(`Email job failed: ${error.message}`);
    throw error;
  }
});
