/**
 * AureliaStay AI — natural-language intent parser.
 *
 * Pure, side-effect-free heuristics that turn a free-text guest message into a
 * structured `intent` + `filters` object. All real-data resolution (hotel name
 * lookups, availability, pricing) happens later in `ai.service.js` against the
 * database — this module only extracts what the user typed.
 *
 * Extracted fields:
 *   intent      — SEARCH_HOTELS | RECOMMEND | HOTEL_ROOMS | ROOM_OPTIONS |
 *                 OFFERS | POLICIES | AMENITIES | PRICING | BOOKING_HELP |
 *                 GREETING | GENERAL
 *   filters     — { destination, checkIn, checkOut, guests, minPrice,
 *                  maxPrice, minRating, category, amenities, sort }
 *   hotelName   — a hotel name the user referenced (raw string)
 *   roomType    — a room type keyword (SUITE / VILLA / PENTHOUSE / …)
 */

const { HOTEL_CATEGORIES, ROOM_TYPES } = require("../../config/constants");

// ─── Category / room-type keyword maps (english → enum) ─────────────────────
const CATEGORY_KEYWORDS = {
  [HOTEL_CATEGORIES.BUDGET]: ["budget", "economy", "affordable", "cheap", "value"],
  [HOTEL_CATEGORIES.STANDARD]: ["standard"],
  [HOTEL_CATEGORIES.LUXURY]: ["luxury", "luxurious", "five star", "5-star", "premium"],
  [HOTEL_CATEGORIES.ULTRA_LUXURY]: ["ultra luxury", "ultra-luxury", "six star", "6-star"],
  [HOTEL_CATEGORIES.RESORT]: ["resort", "resorts"],
  [HOTEL_CATEGORIES.HERITAGE]: ["heritage", "palace", "haveli", "fort"],
  [HOTEL_CATEGORIES.BUSINESS]: ["business", "corporate"],
  [HOTEL_CATEGORIES.BOUTIQUE]: ["boutique"],
};

const ROOM_TYPE_KEYWORDS = {
  [ROOM_TYPES.SUITE]: ["suite", "suites"],
  [ROOM_TYPES.VILLA]: ["villa", "villas"],
  [ROOM_TYPES.PENTHOUSE]: ["penthouse"],
  [ROOM_TYPES.FAMILY]: ["family", "family room"],
  [ROOM_TYPES.SINGLE]: ["single", "single room"],
  [ROOM_TYPES.DOUBLE]: ["double", "deluxe", "king room", "twin"],
};

const AMENITY_ALIASES = {
  pool: ["pool", "swimming pool", "swimming"],
  spa: ["spa"],
  wifi: ["wifi", "wi-fi", "internet", "free wifi"],
  breakfast: ["breakfast", "dining", "restaurant", "restaurants"],
  gym: ["gym", "fitness", "fitness center"],
  parking: ["parking", "free parking"],
  "sea view": ["sea view", "ocean view", "beach view"],
  "air conditioning": ["ac", "air conditioning", "aircon"],
  bar: ["bar"],
  lounge: ["lounge"],
  "room service": ["room service"],
  "pet friendly": ["pet friendly", "pets allowed", "pet"],
  "airport shuttle": ["airport shuttle", "airport transfer"],
  television: ["tv", "television"],
  "business center": ["business center", "business centre"],
};

const GREETING_WORDS = ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "yo", "hola"];
const HELP_WORDS = ["help", "what can you do", "how do you work", "assist"];

/**
 * Parse a raw message into { intent, filters, hotelName, roomType }.
 * @param {string} message - raw user message
 * @returns {object}
 */
function parseIntent(message) {
  const raw = String(message || "").trim();
  const text = raw.toLowerCase();

  // Normalise common date phrasing into YYYY-MM-DD before date extraction.
  const normalized = normalizeDates(text);

  const filters = {
    destination: extractDestination(text),
    checkIn: extractDate(normalized, "checkin"),
    checkOut: extractDate(normalized, "checkout"),
    guests: extractGuests(text),
    minPrice: extractMinPrice(text),
    maxPrice: extractMaxPrice(text),
    minRating: extractMinRating(text),
    category: extractCategory(text),
    amenities: extractAmenities(text),
    sort: extractSort(text),
    ...extractStarFilters(text),
  };

  // Detect intent from strongest signal to weakest.
  let intent = classifyIntent(text, filters, raw);

  return {
    intent,
    filters,
    hotelName: extractHotelName(raw),
    roomType: extractRoomType(text),
    original: raw,
  };
}

// ─── Intent classification ──────────────────────────────────────────────────
function classifyIntent(text, filters, raw) {
  const isGreeting = GREETING_WORDS.some((w) => text.startsWith(w) || text === w || new RegExp(`\\b${w}\\b`).test(text));
  const isHelp = HELP_WORDS.some((w) => text.includes(w));

  // Explicit help / capability questions beat greetings ("hi, what can you do").
  if (isHelp) return "GENERAL";

  if (isGreeting && raw.length <= 20) return "GREETING";

  if (text.includes("how to book") || text.includes("booking process") || text.includes("book a hotel")
    || text.includes("how do i book") || text.includes("guide") || text.includes("step")) {
    return "BOOKING_HELP";
  }

  if (text.includes("cancel") || text.includes("cancellation") || text.includes("check-in") || text.includes("checkin")
    || text.includes("check-out") || text.includes("checkout") || text.includes("pets") || text.includes("policy")
    || text.includes("timing")) {
    return "POLICIES";
  }

  if (text.includes("offer") || text.includes("deal") || text.includes("discount") || text.includes("promo")
    || text.includes("coupon") || text.includes("voucher") || text.includes("saving")) {
    return "OFFERS";
  }

  if (text.includes("amenit") || text.includes("facilit") || text.includes("has a") || text.includes("have a pool")
    || text.includes("does it have") || text.includes("features")) {
    return "AMENITIES";
  }

  // Pricing questions ("how much", "price", "cost", "₹", "rs", "per night").
  if (text.includes("how much") || text.includes("price") || text.includes("cost") || text.includes("per night")
    || /\brate\b/.test(text) || text.includes("₹") || text.includes("rs ") || text.includes("rupees")
    || text.includes("expensive") || text.includes("charge")) {
    return "PRICING";
  }

  // Recommend / best / top rated / suggest → recommended sorting.
  if (text.includes("recommend") || text.includes("suggest") || text.includes("best") || text.includes("top rated")
    || text.includes("best rated") || text.includes("famous") || filters.sort === "recommended") {
    return "RECOMMEND";
  }

  // Room-focussed queries.
  if (text.includes("room") || text.includes("rooms") || text.includes("suite") || text.includes("villa")
    || text.includes("penthouse") || text.includes("stay")) {
    return "HOTEL_ROOMS";
  }

  if (text.includes("hotel") || text.includes("stay") || text.includes("place to stay")
    || text.includes("accommodation") || text.includes("destination") || filters.destination) {
    return "SEARCH_HOTELS";
  }

  return "GENERAL";
}

// ─── Field extractors ───────────────────────────────────────────────────────

/** Common Indian cities (first 5 char match to avoid trailing words). */
const CITIES = [
  "mumbai", "goa", "delhi", "new delhi", "jaipur", "udaipur", "agra", "varanasi", "kolkata",
  "chennai", "bangalore", "bengaluru", "hyderabad", "pune", "ahmedabad", "kerala", "kochi",
  "cochin", "munnar", "ooty", "manali", "shimla", "dehradun", "rishikesh", "mussourie",
  "mussoorie", "jaisalmer", "jodhpur", "amritsar", "leh", "ladakh", "gurgaon", "gurugram",
  "noida", "lucknow", "indore", "bhopal", "surat", "nagpur", "nashik", "lonavala", "khandala",
  "mahabaleshwar", "panchgani", "alibaug", "puri", "konark", "mysore", "coorg", "madurai",
  "coimbatore", "varkala", "alleppey", "goa north", "goa south", "pondicherry", "puducherry",
  "darjeeling", "gangtok", "srinagar", "gulmarg", "phuket", "bali", "dubai", "singapore",
  "paris", "london", "new york", "tokyo", "doha", "bangkok", "male", "maldives", "sydney",
];

function extractDestination(text) {
  for (const city of CITIES) {
    const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match "in goa", "at goa", "goa hotels" or a standalone mention.
    const patterns = [
      new RegExp(`(?:in|at|near|around|for)\\s+${escaped}\\b`, "i"),
      new RegExp(`${escaped}\\s+(?:hotel|hotels|resort|resorts|stay)\\b`, "i"),
    ];
    if (patterns.some((re) => re.test(text))) {
      // Return the canonical city name (first 5-char split handles "new delhi").
      return city;
    }
  }
  return null;
}

/** Replace "check in <date>" / "check out <date>" style phrases with normalized markers. */
function normalizeDates(text) {
  // "from <date> to <date>" / "<date> to <date>" → mark check-in/check-out.
  const dateToken = "(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{1,2}\\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\w*\\s+\\d{4})";
  const fromTo = new RegExp(`(?:from|between)\\s+${dateToken}\\s+(?:to|and|till|until|upto|up to)\\s+${dateToken}`, "i");
  let out = text;
  out = out.replace(fromTo, (_, a, b) => ` checkin:${canonicalDate(a)} checkout:${canonicalDate(b)} `);
  const checkInPhrase = new RegExp(`(?:check\\s*in|arrival|arriving)\\s+(?:on\\s+)?${dateToken}`, "i");
  out = out.replace(checkInPhrase, (_, d) => ` checkin:${canonicalDate(d)} `);
  const checkOutPhrase = new RegExp(`(?:check\\s*out|departure|departing)\\s+(?:on\\s+)?${dateToken}`, "i");
  out = out.replace(checkOutPhrase, (_, d) => ` checkout:${canonicalDate(d)} `);
  return out;
}

/** Normalise a date token to YYYY-MM-DD. */
function canonicalDate(token) {
  const t = String(token).trim();
  // ISO already.
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  // d/m/yyyy or d-m-yyyy.
  let m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // "5 jan 2024"
  m = t.match(/^(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})$/i);
  if (m) {
    const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
    return `${m[3]}-${months[m[2].toLowerCase().slice(0, 3)]}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function extractDate(text, marker) {
  const m = text.match(new RegExp(`${marker}:(\\d{4}-\\d{2}-\\d{2})`));
  return m ? m[1] : null;
}

/** "for 2 adults", "4 guests", "2 adults 1 child". */
function extractGuests(text) {
  let adults = 0;
  let children = 0;

  let m = text.match(/(\d+)\s*(?:adult|adults|person|people|guest|guests)\b/);
  if (m) adults = parseInt(m[1], 10);

  const child = text.match(/(\d+)\s*(?:child|children|kid|kids)\b/);
  if (child) children = parseInt(child[1], 10);

  // Plain "for 3" (context "for 3 guests").
  if (!m) {
    m = text.match(/\b(?:for|with)\s+(\d+)\s*$/);
    if (m) adults = parseInt(m[1], 10);
  }

  if (adults === 0 && children === 0) return null;
  return { adults: Math.max(adults, 1), children };
}

/** "under 5000", "below 8000", "less than", "max 10000", "budget". */
function extractMaxPrice(text) {
  const patterns = [
    /(?:under|below|less than|lesser than|within|max|maximum|upto|up to|at most)\s+₹?\s*([\d,]+)/i,
    /₹?\s*([\d,]+)\s*(?:or less|and below|and under)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  }
  if (text.includes("budget")) return 5000;
  return null;
}

/** "above 20000", "over", "more than", "at least", "min". */
function extractMinPrice(text) {
  const patterns = [
    /(?:above|over|more than|at least|min|minimum|starting from|from)\s+₹?\s*([\d,]+)/i,
    /₹?\s*([\d,]+)\s*(?:and above|and more|plus)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  }
  return null;
}

/** "between 5000 and 15000" → { minPrice, maxPrice }. */
function extractRange(text, filters) {
  const m = text.match(/between\s+₹?\s*([\d,]+)\s+(?:and|to|&|and)\s+₹?\s*([\d,]+)/i);
  if (m) {
    const low = parseInt(m[1].replace(/,/g, ""), 10);
    const high = parseInt(m[2].replace(/,/g, ""), 10);
    filters.minPrice = Math.min(low, high);
    filters.maxPrice = Math.max(low, high);
  }
  return filters;
}

/**
 * Guest-rating (avgRating) threshold, e.g. "top rated", "highly rated".
 * Star-class phrasing is handled by extractStarFilters instead.
 */
function extractMinRating(text) {
  if (text.includes("top rated") || text.includes("best rated") || text.includes("highly rated")) return 4;
  return null;
}

/**
 * Star-class filters, normalised to the public API semantics:
 *   "5 star hotels"         → { starRating: 5 }        (exact star class)
 *   "4+ star" / "5 star and above" → { minStarRating } (threshold)
 */
function extractStarFilters(text) {
  const threshold =
    text.match(/(\d)\s*[-]?\s*\+?\s*star(?:s)?\s*(?:and above|and up|or more|plus)\b/i) ||
    text.match(/(\d)\s*[-]?\s*\+\s*star(?:s)?\b/i);
  if (threshold) return { minStarRating: parseInt(threshold[1], 10) };

  const exact = text.match(/(\d)\s*[-]?\s*star(?:s)?\b/i);
  if (exact) return { starRating: parseInt(exact[1], 10) };

  return {};
}

function extractCategory(text) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return category;
  }
  return null;
}

function extractAmenities(text) {
  const found = [];
  for (const [alias, keys] of Object.entries(AMENITY_ALIASES)) {
    if (keys.some((k) => text.includes(k))) found.push(alias);
  }
  return found.length ? found : null;
}

function extractSort(text) {
  if (text.includes("cheapest") || text.includes("lowest price") || text.includes("affordable")) return "price_asc";
  if (text.includes("most expensive") || text.includes("highest")) return "price_desc";
  if (text.includes("top rated") || text.includes("best rated") || text.includes("highly rated")) return "rating";
  return null;
}

function extractRoomType(text) {
  for (const [type, keys] of Object.entries(ROOM_TYPE_KEYWORDS)) {
    if (keys.some((k) => text.includes(k))) return type;
  }
  return null;
}

/** Best-effort hotel name: a run of capitalized words not covered by keywords. */
function extractHotelName(text) {
  const stop = new Set([
    "in", "at", "the", "of", "and", "for", "with", "from", "to", "hotel", "hotels", "show", "me",
    "rooms", "room", "price", "prices", "cost", "what", "how", "much", "do", "does", "have", "has",
    "a", "an", "is", "are", "please", "i", "we", "like", "want", "recommend", "suggest", "best",
    "top", "rated", "luxury", "offer", "offers", "discount", "deals", "near", "around", "any",
    "you", "tell", "give", "list", "my", "some", "five", "4", "5", "star", "under", "above", "book",
  ]);

  // Match consecutive title-cased words (e.g. "The Grand Palace").
  const matches = text.match(/\b([A-Z][a-zA-Z'&]+(?:\s+[A-Z][a-zA-Z'&]+)*)\b/g) || [];
  for (const phrase of matches) {
    const words = phrase.split(/\s+/).filter((w) => !stop.has(w.toLowerCase()));
    if (words.length >= 2 && phrase.length >= 6) {
      return phrase.trim();
    }
  }
  return null;
}

module.exports = {
  parseIntent,
  extractDestination,
  extractMaxPrice,
  extractMinPrice,
  extractRange,
  extractAmenities,
  extractCategory,
  extractStarFilters,
  extractRoomType,
  extractHotelName,
  CATEGORY_KEYWORDS,
  ROOM_TYPE_KEYWORDS,
  AMENITY_ALIASES,
};