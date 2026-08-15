/**
 * Legal copy for the Privacy, Terms and Cancellation pages. Section shape:
 * { title, body: string[] }.
 */

export const PRIVACY_SECTIONS = [
  {
    title: "1. Information we collect",
    body: [
      "We collect information you provide directly — such as your name, email address, phone number, billing address and payment details — when you create an account, make a booking or contact our concierge.",
      "We also collect limited technical information automatically: your IP address, browser type, pages visited and the date and time of your visit, used to keep the service secure and improve your experience.",
    ],
  },
  {
    title: "2. How we use your information",
    body: [
      "Your information is used to process bookings, confirm payments, send transactional updates, provide concierge support and share tailored offers you've opted into.",
      "We never sell your personal data to third parties.",
    ],
  },
  {
    title: "3. Payments",
    body: [
      "All payments are processed by our PCI-DSS compliant gateway, Razorpay. Card details are transmitted directly to Razorpay over an encrypted connection and are never stored on our servers.",
    ],
  },
  {
    title: "4. Cookies",
    body: [
      "We use essential cookies to keep you signed in and remember your booking journey. Analytics cookies help us understand how the site is used so we can improve it. You can disable cookies in your browser at any time.",
    ],
  },
  {
    title: "5. Data retention & your rights",
    body: [
      "We retain booking and account data only as long as required for legal and operational purposes. You may request a copy of your data, ask for corrections, or request deletion at any time by contacting privacy@aureliastay.com.",
      "You can also manage notification preferences from your profile at any time.",
    ],
  },
  {
    title: "6. Contact",
    body: [
      "For any privacy questions, email privacy@aureliastay.com or write to Aurelia Stay, Concierge Desk, City of Lakes, India.",
    ],
  },
];

export const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using the Aurelia Stay website, mobile services and bookings, you agree to these Terms of Service. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "2. Bookings & rates",
    body: [
      "All rates are per room per night unless stated otherwise and include applicable taxes at the time of booking. While we make every effort to keep published rates accurate, prices may change between visits.",
      "A booking is confirmed once payment has been completed and a confirmation email has been sent to you.",
    ],
  },
  {
    title: "3. Guest responsibility",
    body: [
      "You are responsible for the accuracy of the information provided at booking, for the conduct of all guests in your party, and for any damage caused beyond normal wear and tear.",
    ],
  },
  {
    title: "4. Intellectual property",
    body: [
      "All content on this website — including photographs, text, design and the Aurelia Stay name — is the property of Aurelia Stay and may not be reproduced without written permission.",
    ],
  },
  {
    title: "5. Limitation of liability",
    body: [
      "Aurelia Stay is not liable for indirect or consequential losses arising from the use of our services, including but not limited to lost travel arrangements. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    title: "6. Changes to these terms",
    body: [
      "We may update these terms from time to time. The latest version will always be published on this page, and continued use of the service after changes constitutes acceptance.",
    ],
  },
];

export const CANCELLATION_SECTIONS = [
  {
    title: "Free cancellation window",
    body: [
      "Cancellations made at least 48 hours before the scheduled check-in time on your booking are fully refundable — no fees, no questions.",
    ],
  },
  {
    title: "Within 48 hours of arrival",
    body: [
      "Cancellations received between 48 hours and 24 hours before check-in are charged the first night. Cancellations within 24 hours or no-shows are charged the full stay.",
    ],
  },
  {
    title: "Special rates & packages",
    body: [
      "Promotional, non-refundable and package rates may have different cancellation terms. These are always stated clearly on the room page before you confirm your booking.",
    ],
  },
  {
    title: "Refund processing",
    body: [
      "Approved refunds are returned to the original payment method within 5–10 business days. Your booking's payment status updates as the refund processes.",
    ],
  },
  {
    title: "Force majeure",
    body: [
      "In cases of natural disaster, government restriction or other events beyond our reasonable control, we will work with you to rebook or refund in full.",
    ],
  },
  {
    title: "How to cancel",
    body: [
      "Log in to your account, open the booking and select 'Cancel booking'. Our concierge can also assist by phone or email 24/7.",
    ],
  },
];

export default { PRIVACY_SECTIONS, TERMS_SECTIONS, CANCELLATION_SECTIONS };