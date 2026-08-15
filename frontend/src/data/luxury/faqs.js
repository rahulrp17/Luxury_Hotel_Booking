/**
 * Frequently asked questions grouped by category. Rendered with the shared
 * Accordion component (Accordion takes items = [{ title, content }]).
 */
export const FAQ_CATEGORIES = [
  {
    category: "Bookings & Stays",
    questions: [
      {
        q: "How do I make a reservation?",
        a: "Browse our hotels, select your dates and guests, then choose a room. You'll receive an instant confirmation by email once your booking is secured. Our concierge is also available 24/7 at +91 00000 00000 if you prefer to book by phone.",
      },
      {
        q: "When will I be charged?",
        a: "We place no charge at the time of booking. Payment is taken securely via Razorpay when you complete checkout — cards, UPI, net-banking and international cards are all accepted.",
      },
      {
        q: "Can I modify or cancel my booking?",
        a: "Most bookings can be cancelled online from your account up to 48 hours before check-in. Refunds, where applicable, follow our cancellation policy and are processed automatically to your original payment method.",
      },
      {
        q: "Do you offer early check-in or late check-out?",
        a: "Subject to availability, yes — both can be arranged. Early check-in before noon and late check-out until 2 pm can be requested at the front desk or noted during booking.",
      },
    ],
  },
  {
    category: "At the Resort",
    questions: [
      {
        q: "What's included in my stay?",
        a: "Every stay includes WiFi, access to the pool and fitness centre, in-room amenities, and the daily breakfast service at our main restaurant. Specific inclusions appear on each room before you book.",
      },
      {
        q: "Do you cater to dietary requirements?",
        a: "Absolutely. Our kitchens accommodate vegetarian, vegan, Jain, gluten-free and allergy-aware diets. Please note any requirements in your booking or mention them to the team on arrival.",
      },
      {
        q: "Is the resort family friendly?",
        a: "Yes — we offer connecting suites, kids' amenities, childcare on request and a curated children's itinerary so parents can enjoy some time to themselves.",
      },
      {
        q: "Are pets allowed?",
        a: "Select rooms in our garden and villa categories are pet-friendly. Please contact the concierge before booking so we can prepare a welcome kit for your companion.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    questions: [
      {
        q: "Which payment methods do you accept?",
        a: "All major credit and debit cards, UPI, net-banking, and international cards are processed securely through Razorpay. We also accept payments at the resort.",
      },
      {
        q: "Is my payment information safe?",
        a: "Yes. Payments are handled by Razorpay's PCI-DSS compliant gateway — we never see or store your full card details on our servers.",
      },
      {
        q: "How do refunds work?",
        a: "Approved refunds are returned to the original payment method within 5–10 business days. You'll see the refund reflected in your booking's payment status as it processes.",
      },
    ],
  },
  {
    category: "Getting There",
    questions: [
      {
        q: "Do you provide airport transfers?",
        a: "Yes, private transfers can be arranged from the nearest airport or railway station. Pricing depends on the property — the concierge will confirm when you book.",
      },
      {
        q: "Is parking available?",
        a: "All our properties offer complimentary valet parking for guests.",
      },
    ],
  },
];

export default FAQ_CATEGORIES;