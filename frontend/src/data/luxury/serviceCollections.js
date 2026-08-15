/**
 * Contact & service collection content — Reservations, Customer Support,
 * Locations, Weddings and Corporate Events. Each entry powers a dedicated
 * InfoPage.
 */
import { getFallbackAsset } from "@/constants/assets";

export const SERVICE_COLLECTIONS = [
  {
    id: "reservations",
    seo: {
      title: "Reservations | AureliaStay",
      description:
        "Reserve your AureliaStay — best-rate guarantee, flexible dates, room preferences and our reservations team around the clock.",
    },
    hero: {
      eyebrow: "Contact · Reservations",
      title: "Book With Confidence",
      description:
        "A reservation is a promise, and we treat ours carefully. Best-rate guarantee, flexible change policies and a reservations team that answers day and night.",
      image: getFallbackAsset("hotel", 1),
    },
    intro: {
      eyebrow: "How It Works",
      title: "Your stay, reserved simply",
      description:
        "Choose an address and dates, tell us what makes your stay special, and leave the rest to us. Confirm online in minutes or speak to a person who knows the property.",
      image: getFallbackAsset("gallery", 3),
      points: [
        "Best-rate guarantee",
        "Flexible date changes",
        "Room & floor preferences",
        "Special-occasion notes",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "Ways to Reserve",
        title: "Book however suits you",
        description: "Four simple routes to a confirmed stay.",
        cols: 4,
        items: [
          { icon: "calendar", title: "Online", description: "Reserve in minutes on our website with instant confirmation." },
          { icon: "phone", title: "By phone", description: "Our reservations desk answers around the clock, in person." },
          { icon: "mail", title: "By email", description: "Send a request and our team will reply within the hour." },
          { icon: "users", title: "Direct concierge", description: "For returning guests, a single call to your usual property." },
        ],
      },
      {
        type: "rows",
        eyebrow: "Good To Know",
        title: "The details that matter",
        description: "Everything you need before you book.",
        items: [
          { title: "Best-rate guarantee", meta: "Promised", description: "Book directly with us and never pay more than the lowest available rate." },
          { title: "Flexible changes", meta: "Up to 72h", description: "Change dates without penalty up to 72 hours before arrival, most seasons." },
          { title: "Arrival preferences", meta: "Noted", description: "Floor, view, pillow, celebration — tell us once, remembered always." },
          { title: "Deposit & cancellation", meta: "Clear", description: "Transparent terms shown before you confirm — no surprises at checkout." },
        ],
      },
    ],
    cta: {
      eyebrow: "Ready when you are",
      title: "Your table, room or villa awaits",
      description: "Reserve your stay now, or let our team design it around you.",
    },
  },
  {
    id: "customer-support",
    seo: {
      title: "Customer Support | AureliaStay",
      description:
        "AureliaStay support around the clock — the concierge, phone lines, email support, live chat and the in-house guest relations team.",
    },
    hero: {
      eyebrow: "Contact · Support",
      title: "We're Here, Around the Clock",
      description:
        "Questions before you book, requests during your stay, follow-ups after you leave — our support team treats every one like the first of the day.",
      image: getFallbackAsset("gallery", 5),
    },
    intro: {
      eyebrow: "Always Available",
      title: "A person, not a queue",
      description:
        "Reach a real human in moments, not minutes. Our support spans concierge, front desk and a 24/7 guest relations team who answer with warmth and authority.",
      image: getFallbackAsset("gallery", 2),
      points: [
        "24/7 guest relations",
        "Fast response times",
        "In-house support team",
        "Follow-up after your stay",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "Contact Channels",
        title: "Reach us your way",
        description: "Whatever channel you choose, we answer quickly.",
        cols: 4,
        items: [
          { icon: "phone", title: "Phone", description: "24/7 line answered by a person, in under a minute." },
          { icon: "mail", title: "Email", description: "Replies within the hour, every day of the year." },
          { icon: "send", title: "Live chat", description: "Instant help on the website while you browse." },
          { icon: "bell", title: "In-app", description: "Message your property from the AureliaStay app." },
        ],
      },
      {
        type: "rows",
        eyebrow: "What We Help With",
        title: "Every question, taken seriously",
        description: "The kinds of requests our team handles daily.",
        items: [
          { title: "Before you book", meta: "Planning", description: "Dates, rates, room choices and what to pack for the season." },
          { title: "During your stay", meta: "In-house", description: "Dining, spa, transport and any wish that makes the stay better." },
          { title: "After you leave", meta: "Follow-up", description: "Receipts, lost property and notes for your next visit." },
          { title: "Special requests", meta: "Anything", description: "Allergies, accessibility, celebrations — ask and we will arrange." },
        ],
      },
    ],
    cta: {
      eyebrow: "How can we help?",
      title: "Speak to a human, right now",
      description: "Call, message or visit — our team is ready to help, any hour.",
    },
  },
  {
    id: "locations",
    seo: {
      title: "Locations | AureliaStay",
      description:
        "Find your AureliaStay address — lakeside havelis, coastal retreats, mountain lodges and heritage palaces across our twelve properties.",
    },
    hero: {
      eyebrow: "Contact · Locations",
      title: "Find Your Address",
      description:
        "Twelve exceptional addresses, each rooted in its place — a lake at dawn, a coast at dusk, a mountain in the mist. Find the one that calls to you.",
      image: getFallbackAsset("hotel", 0),
    },
    intro: {
      eyebrow: "Across the Collection",
      title: "A place for every season",
      description:
        "From heritage palaces to shore retreats, every AureliaStay is chosen for the same reasons — stillness, beauty and the quiet craft of hospitality.",
      image: getFallbackAsset("hotel", 2),
      points: [
        "12 exceptional addresses",
        "Direct airport transfers",
        "Seasonal destinations",
        "Accessible routes mapped",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "The Destinations",
        title: "Choose your landscape",
        description: "Four settings, twelve addresses.",
        cols: 4,
        items: [
          { icon: "landmark", title: "Heritage cities", description: "Palaces and havelis in Jaipur, Udaipur and beyond." },
          { icon: "waves", title: "The coast", description: "Beachfront retreats on the southern shores of Goa." },
          { icon: "mountain", title: "The mountains", description: "Alpine house lodges above Shimla, wrapped in orchards." },
          { icon: "leaf", title: "Lake & gardens", description: "Lakeside properties with acres of designed garden." },
        ],
      },
      {
        type: "rows",
        eyebrow: "Getting There",
        title: "Every address, easy to reach",
        description: "Transfers and routing, arranged before you land.",
        items: [
          { title: "Airport transfers", meta: "Arranged", description: "Chauffeured pick-ups arranged at any hour, with a host waiting." },
          { title: "Self-drive routes", meta: "Mapped", description: "Scenic drive guides sent with your confirmation." },
          { title: "Nearest airports", meta: "At a glance", description: "Every property is within 90 minutes of a major airport." },
          { title: "Accessible access", meta: "Mapped", description: "Step-free routes and adapted rooms at every address." },
        ],
      },
    ],
    cta: {
      eyebrow: "Somewhere calling to you",
      title: "Find the address that feels like yours",
      description: "Explore the collection and let us arrange the journey.",
    },
  },
  {
    id: "weddings",
    seo: {
      title: "Weddings | AureliaStay",
      description:
        "Weddings at AureliaStay — lakeside ceremonies, palace settings, dedicated planners, curated venues, catering and celebrations for two to two hundred.",
    },
    hero: {
      eyebrow: "Contact · Weddings",
      title: "Say Yes to the Perfect Setting",
      description:
        "A lake at dawn, a palace at dusk, a garden that has seen a thousand vows. Our wedding team turns the day you have imagined into the one you remember forever.",
      image: getFallbackAsset("hotel", 1),
    },
    intro: {
      eyebrow: "The Day, In Their Hands",
      title: "Weddings, composed entirely",
      description:
        "From the first walk-through to the last dance, a dedicated planner holds every detail — venues, catering, photography, music and the moments in between.",
      image: getFallbackAsset("gallery", 4),
      points: [
        "Dedicated wedding planner",
        "Lakeside & palace venues",
        "Custom catering & cake",
        "For two to two hundred",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "The Settings",
        title: "Where you will say the words",
        description: "Four settings we stage weddings in, across the collection.",
        cols: 4,
        items: [
          { icon: "landmark", title: "Heritage palace", description: "Courtyards and throne rooms for a grand, cinematic day." },
          { icon: "waves", title: "Lakeside ceremony", description: "A mandap on the water's edge as the sun sets gold." },
          { icon: "leaf", title: "Garden pavilions", description: "Candlelit lawns and canopied aisles for an intimate vow." },
          { icon: "moon", title: "Evening celebrations", description: "Receptions under strings of light, long into the night." },
        ],
      },
      {
        type: "rows",
        eyebrow: "What's Included",
        title: "Everything, arranged",
        description: "The details our planners handle so you can be present.",
        items: [
          { title: "Your own planner", meta: "From day one", description: "A single point of contact from first call to last dance." },
          { title: "Venue & styling", meta: "Composed", description: "Florals, lighting and furniture chosen to your palette." },
          { title: "Catering & cake", meta: "Signature", description: "Menus built with our chefs, tastings included." },
          { title: "Guest logistics", meta: "Handled", description: "Room blocks, transfers and welcome notes for your guests." },
        ],
      },
    ],
    cta: {
      eyebrow: "Begin your wedding story",
      title: "Let us plan the day you will never forget",
      description: "Speak to our wedding team and start with a private tour of the settings.",
    },
  },
  {
    id: "corporate-events",
    seo: {
      title: "Corporate Events | AureliaStay",
      description:
        "Corporate events at AureliaStay — boardrooms, offsites, product launches and conferences with dedicated planners, AV, catering and confidential spaces.",
    },
    hero: {
      eyebrow: "Contact · Corporate",
      title: "Business, Beautifully Handled",
      description:
        "Offsites that feel like retreats, launches that feel like theatre. Our corporate events team runs meetings, retreats and galas with the same care we put into a stay.",
      image: getFallbackAsset("hotel", 3),
    },
    intro: {
      eyebrow: "The Business of Events",
      title: "Productive, and genuinely enjoyable",
      description:
        "Dedicated planners, flexible spaces and technology that simply works. From a boardroom for six to a gala for three hundred, we handle the details so you can focus on the room.",
      image: getFallbackAsset("gallery", 0),
      points: [
        "Dedicated event planner",
        "Confidential boardrooms",
        "Reliable AV & connectivity",
        "Retreats & team offsites",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "The Spaces",
        title: "Work, elevated",
        description: "Four kinds of space our corporate clients book most.",
        cols: 4,
        items: [
          { icon: "briefcase", title: "Boardrooms", description: "Private, confidential rooms for decisions that matter." },
          { icon: "users", title: "Offsites & retreats", description: "Whole-resort programmes that teams talk about for years." },
          { icon: "sparkles", title: "Launches & galas", description: "Stage, sound and catering for the evenings that define brands." },
          { icon: "landmark", title: "Conferences", description: "Flexible halls for talks, workshops and keynotes." },
        ],
      },
      {
        type: "rows",
        eyebrow: "What's Included",
        title: "Events that run themselves",
        description: "The essentials our planners bring to every event.",
        items: [
          { title: "Dedicated planner", meta: "One contact", description: "A single point of contact from brief to teardown." },
          { title: "Technology that works", meta: "AV included", description: "Screens, sound, streaming and a tech team on standby." },
          { title: "Catering & breaks", meta: "Signature", description: "Menus, coffee and breaks timed to your agenda." },
          { title: "Guest stays", meta: "Room blocks", description: "Priority room blocks and transfers for your delegates." },
        ],
      },
    ],
    cta: {
      eyebrow: "Plan your event",
      title: "Bring your next meeting to AureliaStay",
      description: "Share your brief and our corporate team will build the day around it.",
    },
  },
];

export const getServiceCollection = (id) =>
  SERVICE_COLLECTIONS.find((item) => item.id === id);

export default SERVICE_COLLECTIONS;