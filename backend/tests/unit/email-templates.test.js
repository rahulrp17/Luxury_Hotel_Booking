/**
 * Unit tests for the luxury email templates (email.templates.js).
 *
 * Verifies that every template renders complete, well-formed HTML with the
 * expected data interpolated, that user-supplied fields are HTML-escaped
 * (no XSS), and that the black + gold styling rules hold (no white
 * backgrounds, dark-friendly text).
 */
const {
  escapeHtml,
  welcomeTemplate,
  passwordResetTemplate,
  bookingConfirmationTemplate,
  bookingCancellationTemplate,
  refundTemplate,
  offerTemplate,
} = require("../../src/modules/notifications/email.templates");

const user = { name: "Alice <Guest>", email: "alice@test.dev" };
const token = "verify-token-123";
const booking = {
  bookingId: "HBP-001",
  checkIn: "2026-08-20",
  checkOut: "2026-08-25",
  pricing: { currency: "INR", totalAmount: 35400 },
  refundAmount: 0,
};
const refund = {
  bookingId: "HBP-001",
  paymentId: "pay_123",
  refundId: "rfnd_456",
  amount: 35400,
  currency: "INR",
  status: "PROCESSED",
  timestamp: "2026-08-14T10:00:00.000Z",
};
const offer = {
  title: "Summer <Escape>",
  code: "SUMMER25",
  discountText: "25% off",
  endDate: "2026-09-30",
  description: "Book a lakeside suite and unwind.",
};

const eachTemplate = [
  ["welcome", () => welcomeTemplate(user, `http://localhost:5173/auth/verify-email?token=${token}`)],
  ["password reset", () => passwordResetTemplate(user, `http://localhost:5173/auth/reset-password?token=${token}`)],
  ["booking confirmation", () => bookingConfirmationTemplate(user, booking)],
  ["booking cancellation", () => bookingCancellationTemplate(user, booking)],
  ["refund", () => refundTemplate(user, refund)],
  ["offer", () => offerTemplate(user, offer)],
];

describe("email templates", () => {
  test("escapeHtml neutralizes dangerous characters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(escapeHtml("It's a & test")).toBe("It&#39;s a &amp; test");
    expect(escapeHtml(null)).toBe("");
  });

  test("every template renders complete standalone HTML documents", () => {
    for (const [, render] of eachTemplate) {
      const html = render();
      expect(html).toContain("<!doctype html>");
      expect(html).toContain("</html>");
      expect(html).toContain("AureliaStay");
    }
  });

  test("every template is black-only backgrounds with gold text accents", () => {
    for (const [, render] of eachTemplate) {
      const html = render();
      // No white or gold backgrounds
      expect(html).not.toMatch(/background-color:#f5f5f5/gi);
      expect(html).not.toMatch(/linear-gradient\(135deg, #f0e0ae/);
      // Content backgrounds are pure black
      expect(html).toMatch(/background-color:#000000/);
      expect(html).toContain("#000000");
    }
  });

  test("brand wordmark renders Aurelia in white and Stay in gold", () => {
    for (const [, render] of eachTemplate) {
      const html = render();
      expect(html).toMatch(/<span style="color:#ffffff;">Aurelia<\/span>/);
      expect(html).toMatch(/<span style="color:#d4af37;text-shadow:0 0 24px rgba\(212,175,55,0.35\);">Stay<\/span>/);
    }
  });

  test("CTA is black with gold label (no gold background)", () => {
    const html = welcomeTemplate(user, "http://localhost:5173/auth/verify-email?token=x");
    expect(html).toMatch(/bgcolor="#000000" style="background-color:#000000/);
    expect(html).toContain('color:#d4af37;text-align:center');
    expect(html).not.toMatch(/linear-gradient\(135deg/);
  });

  test("templates escape user-controlled fields", () => {
    const html = welcomeTemplate(user, "http://localhost:5173/auth/verify-email?token=x");
    expect(html).toContain("Alice &lt;Guest&gt;");
    expect(html).not.toContain("Alice <Guest>");

    const offerHtml = offerTemplate(user, offer);
    expect(offerHtml).toContain("Summer &lt;Escape&gt;");
    expect(offerHtml).not.toContain("Summer <Escape>");
  });

  test("booking confirmation interpolates all booking data", () => {
    const html = bookingConfirmationTemplate(user, booking);
    expect(html).toContain("HBP-001");
    expect(html).toContain("INR 35400");
    expect(html).toContain("Check-in");
    expect(html).toContain("Check-out");
  });

  test("booking cancellation reflects refund policy", () => {
    const withRefund = bookingCancellationTemplate(user, { ...booking, refundAmount: 10000 });
    expect(withRefund).toContain("INR 10000");
    expect(withRefund).toContain("has been initiated");

    const noRefund = bookingCancellationTemplate(user, booking);
    expect(noRefund).toContain("no refund is applicable");
  });

  test("refund template interpolates amount, status and reference", () => {
    const html = refundTemplate(user, refund);
    expect(html).toContain("₹35,400");
    expect(html).toContain("PROCESSED");
    expect(html).toContain("rfnd_456");
    expect(html).toContain("HBP-001");
  });

  test("refund template falls back to paymentId when bookingId is absent", () => {
    const { bookingId, ...noBookingId } = refund;
    const html = refundTemplate(user, noBookingId);
    expect(html).toContain("pay_123");
  });

  test("offer template interpolates code, discount and validity", () => {
    const html = offerTemplate(user, offer);
    expect(html).toContain("SUMMER25");
    expect(html).toContain("25% off");
    expect(html).toContain("Book a lakeside suite and unwind.");
    expect(html).toContain("/offers");
  });

  test("templates contain readable dark-theme link + CTA fallback text", () => {
    for (const [, render] of eachTemplate) {
      const html = render();
      expect(html).toMatch(/href="http/);
      expect(html).toContain("button above");
    }
  });

  test("CTA is compact, centered, and never full-width on mobile", () => {
    const html = welcomeTemplate(user, "http://localhost:5173/auth/verify-email?token=x");
    // Compact width: no fixed oversized width
    expect(html).toMatch(/width:auto/);
    // Centered wrapper table + aligned cell
    expect(html).toContain('align="center"');
    // Media query must NOT force full width on mobile
    expect(html).not.toMatch(/\.cta\s*\{\s*width:\s*100%/);
    expect(html).toContain(".cta { display: inline-block !important; width: auto !important;");
  });

  test("layout adds top/bottom spacers so the email never touches viewport edges", () => {
    for (const [, render] of eachTemplate) {
      const html = render();
      expect(html).toMatch(/Top spacer: comfortable breathing room/);
      expect(html).toMatch(/Bottom spacer/);
      expect(html).toContain('class="vspace" height="32"');
      expect(html).toContain('@media only screen and (max-width: 620px)');
    }
  });

  test("media queries scale container, spacers and CTA for mobile", () => {
    const html = welcomeTemplate(user, "http://localhost:5173/auth/verify-email?token=x");
    expect(html).toContain(".container { width: 100% !important; max-width: 100% !important; }");
    expect(html).toContain(".vspace { height: 16px !important;");
    expect(html).toContain(".head { font-size: 28px !important; }");
    expect(html).toContain("@media only screen and (max-width: 480px)");
  });

  test("templates guard against horizontal overflow", () => {
    const cardTemplates = [
      ["booking confirmation", () => bookingConfirmationTemplate(user, booking)],
      ["booking cancellation", () => bookingCancellationTemplate(user, booking)],
      ["refund", () => refundTemplate(user, refund)],
      ["offer", () => offerTemplate(user, offer)],
    ];
    for (const [, render] of eachTemplate) {
      const html = render();
      expect(html).toContain("overflow-x:hidden");
    }
    for (const [, render] of cardTemplates) {
      const html = render();
      expect(html).toContain("word-break:break-word;overflow-wrap:break-word");
    }
  });
});
