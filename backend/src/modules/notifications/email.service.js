const { getTransporter } = require("../../config/nodemailer");
const logger = require("../../config/logger");
const { BRAND_NAME } = require("../../config/constants");
const { formatMoney } = require("../../utils/money");
const {
  welcomeTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  bookingCancellationTemplate,
  refundTemplate,
  offerTemplate,
} = require("./email.templates");

class EmailService {
  async sendEmail({ to, subject, html }) {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  // ─── Email Templates ─────────────────────────────────────────────────────

  async sendWelcomeEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    return this.sendEmail({
      to: user.email,
      subject: `Welcome to ${BRAND_NAME} - Verify Your Email`,
      html: welcomeTemplate(user, verificationUrl),
    });
  }

  async sendPasswordResetEmail(user, rawToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

    return this.sendEmail({
      to: user.email,
      subject: `Password Reset - ${BRAND_NAME}`,
      html: passwordResetTemplate(user, resetUrl),
    });
  }

  async sendBookingConfirmation(user, booking) {
    return this.sendEmail({
      to: user.email,
      subject: `Booking Confirmed: ${booking.bookingId}`,
      html: bookingConfirmationTemplate(user, booking),
    });
  }

  async sendBookingCancellation(user, booking) {
    return this.sendEmail({
      to: user.email,
      subject: `Booking Cancelled: ${booking.bookingId}`,
      html: bookingCancellationTemplate(user, booking),
    });
  }

  /**
   * Refund processed email. `refund` carries { bookingId, paymentId, refundId,
   * amount, currency, status, timestamp } and is built by the notification
   * layer after a gateway-accepted refund is persisted — never from client input.
   */
  async sendRefundEmail(user, refund) {
    const currency = refund.currency || "INR";
    const amountText = formatMoney(refund.amount, currency);

    return this.sendEmail({
      to: user.email,
      subject: `Refund Processed: ${amountText}`,
      html: refundTemplate(user, refund),
    });
  }

  /**
   * New offer email. `offer` is the persisted Offer document plus a precomputed
   * `discountText` added by the notification layer for a consistent summary.
   */
  async sendOfferEmail(user, offer) {
    return this.sendEmail({
      to: user.email,
      subject: `Special Offer: ${offer.title}`,
      html: offerTemplate(user, offer),
    });
  }
}

module.exports = new EmailService();
