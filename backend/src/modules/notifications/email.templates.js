/**
 * Shared luxury email templates (black + gold) used by email.service.js.
 *
 * All markup is inline-styled and table-based so it renders correctly in
 * Gmail, Outlook, Apple Mail and mobile clients. Content/data/logic stays
 * unchanged — only presentation is handled here.
 */
const { formatMoney } = require("../../utils/money");
const { formatOfferDiscount } = require("../../utils/offerHelpers");
const { BRAND_NAME } = require("../../config/constants");

/**
 * Escape user-supplied values for safe interpolation into HTML email templates,
 * preventing stored/reflected XSS via fields such as a user's name.
 */
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

// ─── Palette (black + gold only) ───────────────────────────────────────────
const C = {
  ink: "#000000",
  panel: "#000000",
  panelAlt: "#000000",
  white: "#ffffff",
  gold: "#d4af37",
  goldLight: "#f0e0ae",
  goldDark: "#a8871f",
  champagne: "#d8cca8",
  muted: "#a08f63",
  border: "rgba(212,175,55,0.38)",
  borderSoft: "rgba(212,175,55,0.18)",
};

const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";
const SANS = "'Inter',Arial,'Helvetica Neue',Helvetica,sans-serif";

/**
 * Brand wordmark: "Aurelia" in white, "Stay" in gold. Falls back to a white
 * wordmark for any BRAND_NAME that doesn't split on "Stay". Font sizing is
 * applied at the call sites' inline styles, so no parameters are needed here.
 */
const brandWordmark = () => {
  const name = BRAND_NAME || "AureliaStay";
  const stayIndex = name.indexOf("Stay");
  const first = stayIndex > 0 ? name.slice(0, stayIndex) : name;
  const stay = stayIndex > 0 ? name.slice(stayIndex) : "";
  const glow = "text-shadow:0 0 24px rgba(212,175,55,0.35);";
  return `${first && `<span style="color:${C.white};">${escapeHtml(first)}</span>`}${
    stay && `<span style="color:${C.gold};${glow}">${escapeHtml(stay)}</span>`
  }`;
};

// ─── Layout shell ──────────────────────────────────────────────────────────
const layout = ({ preheader, content }) => `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${escapeHtml(preheader)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .vspace { height: 16px !important; line-height: 16px !important; }
      .inner { padding: 24px 20px !important; }
      .stack { padding: 0 20px !important; }
      .head { font-size: 28px !important; }
      .cta-row { padding-left: 20px !important; padding-right: 20px !important; }
      .cta { display: inline-block !important; width: auto !important; padding: 13px 24px !important; font-size: 13px !important; }
      .muted-cell { word-break: break-word !important; }
    }
    @media only screen and (max-width: 480px) {
      .head { font-size: 24px !important; }
      .cta { padding: 12px 20px !important; font-size: 12px !important; }
    }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${C.ink};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;overflow-x:hidden;">
  <span style="display:none;max-height:0;max-width:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.ink};">${escapeHtml(preheader)}</span>
  <!--[if mso]><center><table role="presentation" width="600"><tr><td style="padding:32px 0;"><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.ink};">
    <tr>
      <td align="center" style="padding:0;">
        <!-- Top spacer: comfortable breathing room on desktop, no viewport-edge contact -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="vspace" height="32" style="height:32px;font-size:0;line-height:32px;">&nbsp;</td></tr>
        </table>
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:600px;max-width:600px;background-color:${C.panel};border:1px solid ${C.border};border-radius:12px;box-shadow:0 0 0 1px rgba(212,175,55,0.06), 0 0 60px rgba(212,175,55,0.08);">
          ${content}
        </table>
        <!-- Bottom spacer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="vspace" height="32" style="height:32px;font-size:0;line-height:32px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table></center><![endif]-->
</body>
</html>
`;

// ─── Reusable blocks ───────────────────────────────────────────────────────
const brandHeader = () => `
  <tr>
    <td class="inner" align="center" style="padding:36px 40px 8px 40px;">
      <div class="head" style="font-family:${SERIF};font-size:34px;font-weight:600;letter-spacing:4px;">${brandWordmark()}</div>
      <div style="font-family:${SANS};font-size:11px;letter-spacing:5px;text-transform:uppercase;color:${C.muted};margin-top:6px;">Luxury Hotels &amp; Resorts</div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 40px 0 40px;">
      <table role="presentation" width="120" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td height="1" bgcolor="${C.gold}" style="height:1px;font-size:0;line-height:0;background:linear-gradient(90deg, ${C.goldDark} 0%, ${C.gold} 35%, ${C.goldLight} 50%, ${C.gold} 65%, ${C.goldDark} 100%);">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
`;

const eyebrow = (text) => `
  <div style="font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.goldDark};margin-bottom:10px;">${escapeHtml(text)}</div>
`;

const heading = (text) => `
  <h1 style="margin:0 0 14px 0;font-family:${SERIF};font-size:26px;font-weight:600;line-height:1.3;color:${C.goldLight};">${text}</h1>
`;

const paragraph = (text) => `
  <p style="margin:0 0 16px 0;font-family:${SANS};font-size:15px;line-height:1.75;color:${C.champagne};">${text}</p>
`;

const divider = () => `
  <tr>
    <td class="stack" style="padding:8px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td height="1" bgcolor="${C.borderSoft}" style="height:1px;font-size:0;line-height:0;background-color:${C.borderSoft};">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
`;

/** Glass-style detail card: rows of [label, valueHtml]. */
const infoCard = (rows) => `
  <tr>
    <td class="stack" style="padding:6px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panelAlt}" style="border:1px solid ${C.border};border-radius:8px;background:linear-gradient(160deg, ${C.panelAlt} 0%, ${C.panel} 100%);box-shadow:inset 0 0 24px rgba(212,175,55,0.05);">
        ${rows
          .map(
            ([label, valueHtml]) => `
        <tr>
          <td class="muted-cell" style="padding:13px 18px;border-bottom:1px solid ${C.borderSoft};font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};width:42%;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:13px 18px;border-bottom:1px solid ${C.borderSoft};font-family:${SANS};font-size:15px;color:${C.goldLight};vertical-align:top;word-break:break-word;overflow-wrap:break-word;">${valueHtml}</td>
        </tr>`,
          )
          .join("")}
      </table>
    </td>
  </tr>
`;

/** Black CTA button (gold label/border, never white bg), compact + centered. */
const cta = (url, label) => `
  <tr>
    <td align="center" class="cta-row" style="padding:22px 40px 6px 40px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(url)}" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="12%" strokecolor="${C.gold}" fillcolor="${C.ink}">
        <w:anchorlock/>
        <center style="color:${C.gold};font-family:${SANS};font-size:14px;font-weight:600;letter-spacing:2px;">${escapeHtml(label)}</center>
      </v:roundrect>
      <![endif]-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td align="center" bgcolor="${C.ink}" style="background-color:${C.ink};border-radius:6px;border:1px solid ${C.gold};box-shadow:0 4px 20px rgba(212,175,55,0.25);">
            <a href="${escapeHtml(url)}" target="_blank" class="cta" style="display:inline-block;width:auto;padding:13px 28px;font-family:${SANS};font-size:14px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;color:${C.gold};text-align:center;border-radius:6px;">${escapeHtml(label)}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

/** Fallback plain link (readable on dark, no button styling). */
const fallbackLink = (url, label) => `
  <tr>
    <td align="center" style="padding:8px 40px 6px 40px;">
      <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted};">
        If the button above doesn't work, ${label ? `<strong style="color:${C.champagne};">${escapeHtml(label)}</strong>: ` : ""}
        <a href="${escapeHtml(url)}" target="_blank" style="color:${C.gold};text-decoration:underline;word-break:break-all;">${escapeHtml(url)}</a>
      </p>
    </td>
  </tr>
`;

const footerNote = (text) => `
  <tr>
    <td class="stack" style="padding:14px 40px 6px 40px;">
      <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted};">${text}</p>
    </td>
  </tr>
`;

const footerBlock = () => `
  <tr>
    <td align="center" style="padding:26px 40px 32px 40px;">
      <div style="font-family:${SERIF};font-size:18px;letter-spacing:3px;margin-bottom:8px;">${brandWordmark("18px", "3px")}</div>
      <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.8;color:${C.muted};">© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.<br>This is a service email from ${BRAND_NAME}.</p>
    </td>
  </tr>
`;

// ─── Welcome / email verification ──────────────────────────────────────────
const welcomeTemplate = (user, verificationUrl) =>
  layout({
    preheader: `Welcome to ${BRAND_NAME} — please verify your email address.`,
    content: `
      ${brandHeader()}
      <tr><td class="inner" style="padding:30px 40px 6px 40px;">
        ${eyebrow("Welcome")}
        ${heading(`Welcome to ${BRAND_NAME}, ${escapeHtml(user.name)}`)}
        ${paragraph(`We're thrilled to have you with us. Please confirm your email address to complete your registration and start booking your stays.`)}
      </td></tr>
      ${divider()}
      <tr><td class="inner" style="padding:4px 40px 0 40px;">
        ${paragraph(`Verify your email by clicking the button below. This link expires in <strong style="color:${C.goldLight};">24 hours</strong>.`)}
      </td></tr>
      ${cta(verificationUrl, "Verify Email")}
      ${fallbackLink(verificationUrl, "Verify your email")}
      ${footerNote(`If you didn't create an account with ${BRAND_NAME}, you can safely ignore this email.`)}
      ${footerBlock()}
    `,
  });

// ─── Password reset ────────────────────────────────────────────────────────
const passwordResetTemplate = (user, resetUrl) =>
  layout({
    preheader: `Password reset request for your ${BRAND_NAME} account.`,
    content: `
      ${brandHeader()}
      <tr><td class="inner" style="padding:30px 40px 6px 40px;">
        ${eyebrow("Account Security")}
        ${heading("Password Reset Request")}
        ${paragraph(`Hello ${escapeHtml(user.name)}, we received a request to reset your password. Use the button below to set a new one.`)}
      </td></tr>
      ${divider()}
      <tr><td class="inner" style="padding:4px 40px 0 40px;">
        ${paragraph(`This link expires in <strong style="color:${C.goldLight};">1 hour</strong>. If you didn't request this, you can safely ignore this email and your password will remain unchanged.`)}
      </td></tr>
      ${cta(resetUrl, "Reset Password")}
      ${fallbackLink(resetUrl, "Reset your password")}
      ${footerBlock()}
    `,
  });

// ─── Booking confirmation ──────────────────────────────────────────────────
const bookingConfirmationTemplate = (user, booking) => {
  const totalText = `${booking.pricing.currency} ${booking.pricing.totalAmount}`;
  const myBookingsUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-bookings`;
  return layout({
    preheader: `Booking ${booking.bookingId} confirmed — we look forward to hosting you.`,
    content: `
      ${brandHeader()}
      <tr><td class="inner" style="padding:30px 40px 6px 40px;">
        ${eyebrow("Booking Confirmed")}
        ${heading("Your Stay Is Booked")}
        ${paragraph(`Hello ${escapeHtml(user.name)}, your booking has been confirmed. Here are your stay details:`)}
      </td></tr>
      ${infoCard([
        ["Booking ID", `<strong>${escapeHtml(booking.bookingId)}</strong>`],
        ["Check-in", escapeHtml(new Date(booking.checkIn).toLocaleDateString())],
        ["Check-out", escapeHtml(new Date(booking.checkOut).toLocaleDateString())],
        ["Total Amount", `<strong>${escapeHtml(totalText)}</strong>`],
      ])}
      <tr><td class="inner" style="padding:18px 40px 0 40px;">
        ${paragraph(`We look forward to hosting you. Our concierge is at your service.`)}
      </td></tr>
      ${cta(myBookingsUrl, "View My Bookings")}
      ${fallbackLink(myBookingsUrl, "View your bookings")}
      ${footerBlock()}
    `,
  });
};

// ─── Booking cancellation ──────────────────────────────────────────────────
const bookingCancellationTemplate = (user, booking) => {
  const refundText =
    booking.refundAmount > 0
      ? `A refund of ${escapeHtml(booking.pricing.currency)} ${escapeHtml(booking.refundAmount)} has been initiated and will reflect in your account soon.`
      : "As per the cancellation policy, no refund is applicable for this cancellation.";
  const myBookingsUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-bookings`;
  return layout({
    preheader: `Booking ${booking.bookingId} has been cancelled.`,
    content: `
      ${brandHeader()}
      <tr><td class="inner" style="padding:30px 40px 6px 40px;">
        ${eyebrow("Booking Update")}
        ${heading("Booking Cancelled")}
        ${paragraph(`Hello ${escapeHtml(user.name)}, your booking has been successfully cancelled.`)}
      </td></tr>
      ${infoCard([
        ["Booking ID", `<strong>${escapeHtml(booking.bookingId)}</strong>`],
        ["Refund", `<strong>${refundText}</strong>`],
      ])}
      <tr><td class="inner" style="padding:18px 40px 0 40px;">
        ${paragraph(`We hope to welcome you again soon. Should you have any questions, our team is here to help.`)}
      </td></tr>
      ${cta(myBookingsUrl, "View My Bookings")}
      ${fallbackLink(myBookingsUrl, "View your bookings")}
      ${footerBlock()}
    `,
  });
};

// ─── Refund processed ──────────────────────────────────────────────────────
const refundTemplate = (user, refund) => {
  const currency = refund.currency || "INR";
  const amountText = formatMoney(refund.amount, currency);
  const when = refund.timestamp
    ? new Date(refund.timestamp).toLocaleString("en-IN")
    : "just now";
  const bookingLabel = refund.bookingId || refund.paymentId || "your booking";
  const myBookingsUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-bookings`;
  return layout({
    preheader: `Refund processed — ${amountText} is on its way.`,
    content: `
      ${brandHeader()}
      <tr><td class="inner" style="padding:30px 40px 6px 40px;">
        ${eyebrow("Refund Processed")}
        ${heading("Your Refund Has Been Processed")}
        ${paragraph(`Hello ${escapeHtml(user.name)}, a refund has been successfully processed for your booking.`)}
      </td></tr>
      ${infoCard([
        ["Booking ID", escapeHtml(bookingLabel)],
        ["Refund Amount", `<strong>${escapeHtml(amountText)}</strong>`],
        ["Status", escapeHtml(refund.status || "PROCESSED")],
        ["Processed At", escapeHtml(when)],
        ["Reference", escapeHtml(refund.refundId || "—")],
      ])}
      <tr><td class="inner" style="padding:18px 40px 0 40px;">
        ${paragraph(`Please allow a few business days for the amount to reflect in your original payment method.`)}
      </td></tr>
      ${cta(myBookingsUrl, "View My Bookings")}
      ${fallbackLink(myBookingsUrl, "View your bookings")}
      ${footerBlock()}
    `,
  });
};

// ─── New offer ─────────────────────────────────────────────────────────────
const offerTemplate = (user, offer) => {
  const discountText = offer.discountText || formatOfferDiscount(offer);
  const validTill = offer.endDate
    ? new Date(offer.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "soon";
  const offersUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/offers`;
  return layout({
    preheader: `${escapeHtml(offer.title)} — a special offer just for you.`,
    content: `
      ${brandHeader()}
      <tr><td class="inner" style="padding:30px 40px 6px 40px;">
        ${eyebrow("Special Offer")}
        ${heading(escapeHtml(offer.title))}
        ${paragraph(`Hello ${escapeHtml(user.name)}, we have a special offer just for you:`)}
      </td></tr>
      ${infoCard([
        ["Offer", `<strong style="color:${C.goldLight};">${escapeHtml(discountText)}</strong>`],
        ["Promo Code", `<strong style="font-size:18px;letter-spacing:2px;">${escapeHtml(offer.code)}</strong>`],
        ["Valid Until", escapeHtml(validTill)],
      ])}
      ${
        offer.description
          ? `<tr><td class="inner" style="padding:14px 40px 0 40px;">${paragraph(escapeHtml(offer.description))}</td></tr>`
          : ""
      }
      ${cta(offersUrl, "Explore Offers")}
      ${fallbackLink(offersUrl, "View all offers")}
      ${footerNote(`Treat yourself to an unforgettable stay with ${BRAND_NAME}.`)}
      ${footerBlock()}
    `,
  });
};

module.exports = {
  escapeHtml,
  welcomeTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  bookingCancellationTemplate,
  refundTemplate,
  offerTemplate,
};
