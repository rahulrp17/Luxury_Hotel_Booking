/**
 * About-family collection content — Luxury Philosophy, Awards,
 * Sustainability, Press and Careers. Each entry powers a dedicated InfoPage.
 */
import { getFallbackAsset } from "@/constants/assets";

export const ABOUT_COLLECTIONS = [
  {
    id: "luxury-philosophy",
    seo: {
      title: "Luxury Philosophy | AureliaStay",
      description:
        "AureliaStay's philosophy of luxury — stillness, place, discretion and considered craft define what we build, and what we never do.",
    },
    hero: {
      eyebrow: "About · Philosophy",
      title: "Luxury, Considered Differently",
      description:
        "We have never chased marble for its own sake. True luxury, as we see it, is measured in what you don't notice — a door that never creaks, a greeting that never startles, an evening that simply flows.",
      image: getFallbackAsset("hotel", 0),
    },
    intro: {
      eyebrow: "What We Believe",
      title: "Four quiet principles",
      description:
        "Every AureliaStay address is built on the same four pillars. Wherever you stay, in whatever season, they hold.",
      image: getFallbackAsset("hotel", 1),
      points: [
        "Stillness before spectacle",
        "Place over pastiche",
        "Discretion as a virtue",
        "Craft in the smallest detail",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "The Pillars",
        title: "What defines a luxury stay",
        description: "The ideas behind every AureliaStay address.",
        cols: 4,
        items: [
          { icon: "moon", title: "Stillness", description: "Rooms that quiet the mind — soft light, thick walls, an unhurried pace." },
          { icon: "mapPin", title: "Place", description: "Rooted in location — local architecture, produce and stories, never a formula." },
          { icon: "eye", title: "Discretion", description: "Present without intruding; preferences remembered across every visit." },
          { icon: "star", title: "Considered craft", description: "Hand-blocked linens, cellar pours and details chosen slowly." },
        ],
      },
      {
        type: "rows",
        eyebrow: "In Practice",
        title: "The philosophy, made visible",
        description: "Three ways our beliefs show up in a single stay.",
        items: [
          { title: "The arrival ritual", meta: "Welcome", description: "No queues, no forms at the desk — you are greeted by name, walked to your room, and the paperwork follows you." },
          { title: "The considered room", meta: "Design", description: "Linens pressed in-house, water set at the perfect temperature, a window that frames the best view of the place." },
          { title: "The quiet goodbye", meta: "Departure", description: "Billing settled while you sleep, a car waiting, and a preference card filed for the next visit." },
        ],
      },
    ],
    cta: {
      eyebrow: "Experience the philosophy",
      title: "Luxury, as we define it",
      description: "Step into an AureliaStay and feel what we mean — reserve your first stay today.",
    },
  },
  {
    id: "awards",
    seo: {
      title: "Awards & Recognition | AureliaStay",
      description:
        "Awards and recognition received by AureliaStay — world's best hotel brands, five-star honours, sustainability accolades and editorial praise.",
    },
    hero: {
      eyebrow: "About · Awards",
      title: "Recognized for the Exceptional",
      description:
        "We build for our guests, not for trophies — but it is deeply meaningful when the industry and the press notice the standard we hold ourselves to.",
      image: getFallbackAsset("hotel", 2),
    },
    intro: {
      eyebrow: "The Honours",
      title: "A standard, confirmed",
      description:
        "From global hotel brand rankings to sustainability accolades, our recognitions come from every corner of the industry — and we hold ourselves to all of them.",
      image: getFallbackAsset("gallery", 3),
      points: [
        "Global brand recognition",
        "Five-star service honours",
        "Sustainability accreditations",
        "Guest-rated excellence",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "By Category",
        title: "Where we are recognized",
        description: "The disciplines our teams are honoured for, year after year.",
        cols: 4,
        items: [
          { icon: "crown", title: "Brand excellence", description: "Named among the world's leading luxury hotel collections." },
          { icon: "star", title: "Service & hospitality", description: "Five-star honours for white-glove service and guest care." },
          { icon: "leaf", title: "Sustainability", description: "Gold-tier environmental and responsible-tourism accreditations." },
          { icon: "landmark", title: "Heritage & design", description: "Recognition for restoring heritage properties with craft." },
        ],
      },
      {
        type: "rows",
        eyebrow: "Recent Honours",
        title: "A few we are proud of",
        description: "A selection of recent recognitions across the collection.",
        items: [
          { title: "World's Best Hotel Brands", meta: "2025", description: "Ranked among the top luxury hotel collections worldwide in the annual industry poll." },
          { title: "Gold Sustainability Rating", meta: "2025", description: "Gold-tier award for responsible tourism, renewable energy and zero-waste kitchens." },
          { title: "Reader's Choice: Best Private Villas", meta: "2024", description: "Voted best private villa collection in a reader survey of 40,000 travellers." },
          { title: "Heritage Restoration Prize", meta: "2024", description: "Recognised for the sensitive restoration of our Jaipur palace property." },
        ],
      },
    ],
    cta: {
      eyebrow: "See the standard yourself",
      title: "Awarded, but never resting",
      description: "Every honour is a new bar we hold ourselves to — come and judge the standard.",
    },
  },
  {
    id: "sustainability",
    seo: {
      title: "Sustainability | AureliaStay",
      description:
        "AureliaStay's commitment to a more considered future — renewable energy, water stewardship, local sourcing and zero-waste kitchens across the collection.",
    },
    hero: {
      eyebrow: "About · Sustainability",
      title: "A More Considered Future",
      description:
        "Luxury and responsibility are not opposites. The same care we put into a room we put into the ground beneath it — and the communities around it.",
      image: getFallbackAsset("hotel", 3),
    },
    intro: {
      eyebrow: "Our Commitment",
      title: "Considered in everything",
      description:
        "We measure our impact as carefully as our guest satisfaction. Renewable energy, water stewardship, local sourcing and zero-waste kitchens are standards, not marketing.",
      image: getFallbackAsset("gallery", 5),
      points: [
        "Renewable energy first",
        "Water saved and reused",
        "Local, seasonal sourcing",
        "Zero-waste kitchens",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "The Pillars",
        title: "Four commitments, held everywhere",
        description: "Standards that apply at every AureliaStay address.",
        cols: 4,
        items: [
          { icon: "sun", title: "Renewable energy", description: "Solar arrays and green-tariff power across the collection." },
          { icon: "waves", title: "Water stewardship", description: "Rainwater harvesting, linen reuse and landscape drip systems." },
          { icon: "leaf", title: "Local sourcing", description: "Produce from our gardens and farms within the region." },
          { icon: "flame", title: "Zero-waste kitchens", description: "Menu planning, composting and partner charities for surplus." },
        ],
      },
      {
        type: "rows",
        eyebrow: "In Action",
        title: "Progress we can measure",
        description: "A snapshot of what our teams have achieved together.",
        items: [
          { title: "70% renewable energy", meta: "Collection-wide", description: "Solar and green tariffs now power the majority of our properties." },
          { title: "500+ tonnes food rescued", meta: "Annual", description: "Surplus from our kitchens reaches community kitchens each year." },
          { title: "Gardens on every estate", meta: "12 properties", description: "Every address grows its own herbs, greens and seasonal fruit." },
          { title: "Single-use plastics removed", meta: "2023", description: "All properties fully eliminated single-use plastics from guest areas." },
        ],
      },
    ],
    cta: {
      eyebrow: "Stay, considered",
      title: "Luxury that gives back",
      description: "Every stay contributes to the places we call home — reserve yours today.",
    },
  },
  {
    id: "press",
    seo: {
      title: "Press & Media | AureliaStay",
      description:
        "AureliaStay in the press — travel features, editorial reviews, interviews and media coverage of the collection across leading publications.",
    },
    hero: {
      eyebrow: "About · Press",
      title: "AureliaStay in the Press",
      description:
        "From travel monthlies to global newspapers, the world has been kind enough to write about what we build. Here is a little of what they have said.",
      image: getFallbackAsset("gallery", 4),
    },
    intro: {
      eyebrow: "Media Highlights",
      title: "A reputation, written down",
      description:
        "Our press features span the collection — from our heritage palaces to our coast retreats — and the recurring theme is quiet: a standard that speaks softly and lingers.",
      image: getFallbackAsset("gallery", 2),
      points: [
        "Global travel press",
        "Editorial reviews",
        "Founder interviews",
        "Design & culture features",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "Coverage",
        title: "Where we appear",
        description: "The stories the press keeps telling about AureliaStay.",
        cols: 4,
        items: [
          { icon: "star", title: "Editorial reviews", description: "Star-rated reviews of rooms, dining and service." },
          { icon: "landmark", title: "Design features", description: "Heritage restoration and considered interiors." },
          { icon: "leaf", title: "Sustainability stories", description: "Our zero-waste kitchens and renewable estates." },
          { icon: "heart", title: "Travel features", description: "Escapes, itineraries and stays worth the miles." },
        ],
      },
      {
        type: "rows",
        eyebrow: "In Their Words",
        title: "A selection of recent features",
        description: "A few of the pieces that made us smile.",
        items: [
          { title: "The New Standard of Quiet Luxury", meta: "Travel Monthly · 2025", description: "A six-page feature on how AureliaStay redefined understated hospitality." },
          { title: "Palace on the Water", meta: "Heritage & Homes · 2024", description: "The restoration of our Jaipur palace, photographed over three seasons." },
          { title: "A Kitchen That Wastes Nothing", meta: "Good Living · 2024", description: "Inside the zero-waste kitchens running our dining rooms." },
          { title: "Where the Press Stays", meta: "Wander Quarterly · 2023", description: "Why editors quietly book the same three addresses, year after year." },
        ],
      },
    ],
    cta: {
      eyebrow: "For press enquiries",
      title: "Write about AureliaStay",
      description: "Our press team is happy to host visits, arrange interviews and share assets.",
    },
  },
  {
    id: "careers",
    seo: {
      title: "Careers | AureliaStay",
      description:
        "Careers at AureliaStay — build the future of hospitality. Explore roles across front office, culinary, wellness, leadership and our graduate programme.",
    },
    hero: {
      eyebrow: "About · Careers",
      title: "Build the Future of Hospitality",
      description:
        "We hire for warmth and craft before anything else. Join a team that treats every guest like a returning friend and every detail as a chance to be brilliant.",
      image: getFallbackAsset("gallery", 0),
    },
    intro: {
      eyebrow: "Why AureliaStay",
      title: "Careers that mean something",
      description:
        "Training academies, clear progression and a culture of quiet pride. Whatever your role, you will be empowered to do your best work — and recognised for it.",
      image: getFallbackAsset("gallery", 1),
      points: [
        "Warmth and craft first",
        "Training academies on site",
        "Clear paths to leadership",
        "Global opportunities",
      ],
    },
    sections: [
      {
        type: "cards",
        eyebrow: "Our Teams",
        title: "Find your department",
        description: "Where AureliaStay careers are built, every day.",
        cols: 4,
        items: [
          { icon: "bell", title: "Front office", description: "Concierge, guest relations and the art of the perfect arrival." },
          { icon: "utensils", title: "Culinary", description: "Kitchens, bars and the tasting counters where reputations are made." },
          { icon: "sparkles", title: "Wellness", description: "Spa, yoga and wellness teams who care for body and mind." },
          { icon: "briefcase", title: "Leadership", description: "General managers, directors and the people who shape the brand." },
        ],
      },
      {
        type: "rows",
        eyebrow: "The Experience",
        title: "What we offer our people",
        description: "The basics, and the parts that are harder to put on a contract.",
        items: [
          { title: "The Aurelia Academy", meta: "Learning", description: "On-site training in service, wine, wellness and leadership — with certification." },
          { title: "Grow with the brand", meta: "Progression", description: "Two-thirds of our managers started in front-line roles. The path is real." },
          { title: "Lives lived well", meta: "Wellbeing", description: "Accommodation, meals, healthcare and time off that is actually taken." },
          { title: "A graduate programme", meta: "Future Leaders", description: "An 18-month rotation across properties for the next generation of hoteliers." },
        ],
      },
    ],
    cta: {
      eyebrow: "Start your application",
      title: "Bring your warmth to AureliaStay",
      description: "We would love to meet you — send your details and our people team will be in touch.",
    },
  },
];

export const getAboutCollection = (id) =>
  ABOUT_COLLECTIONS.find((item) => item.id === id);

export default ABOUT_COLLECTIONS;