const axios = require("axios");
const logger = require("../../config/logger");

class SmsService {
  /**
   * Send SMS via generic provider (e.g., Fast2SMS, Twilio)
   */
  async sendSms({ phone, message }) {
    if (!process.env.SMS_API_KEY) {
      logger.warn(`SMS mocked (No API Key). To: ${phone}, Msg: ${message}`);
      return true; // Mock success in dev
    }

    try {
      // Example using Fast2SMS API format
      // Modify this method based on your actual SMS provider's API
      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "q",
          message: message,
          language: "english",
          flash: 0,
          numbers: phone,
        },
        {
          headers: {
            authorization: process.env.SMS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info(`SMS sent to ${phone}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to send SMS to ${phone}: ${error.message}`);
      // Don't throw error to prevent failing the main transaction
      return false; 
    }
  }

  // ─── SMS Templates ───────────────────────────────────────────────────────

  async sendBookingConfirmation(user, booking) {
    const message = `Dear ${user.name}, your booking ${booking.bookingId} is confirmed for ${new Date(booking.checkIn).toLocaleDateString()}. Thank you for choosing us!`;
    return this.sendSms({ phone: user.phone, message });
  }

  async sendCheckInReminder(user, booking) {
    const message = `Reminder: Check-in for your booking ${booking.bookingId} is tomorrow at 14:00. Safe travels!`;
    return this.sendSms({ phone: user.phone, message });
  }
}

module.exports = new SmsService();
