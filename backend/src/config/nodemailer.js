const nodemailer = require("nodemailer");
const logger = require("./logger");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify connection
    transporter.verify((error) => {
      if (error) {
        logger.error(`SMTP connection error: ${error.message}`);
      } else {
        logger.info("📧 Nodemailer SMTP transporter ready.");
      }
    });
  }
  return transporter;
};

module.exports = { getTransporter };
