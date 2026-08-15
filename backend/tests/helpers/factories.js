/* eslint-disable camelcase */
/**
 * Shared test factories + authentication helpers.
 *
 * Every suite should reuse these so test data is consistent and cheap to build.
 * Factories return already-persisted Mongoose documents; overrides spread last
 * so you can customise just the fields you care about.
 */
const mongoose = require("mongoose");
const User = require("../../src/modules/users/user.model");
const Hotel = require("../../src/modules/hotels/hotel.model");
const Room = require("../../src/modules/rooms/room.model");
const Amenity = require("../../src/modules/amenities/amenity.model");
const Booking = require("../../src/modules/bookings/booking.model");
const Offer = require("../../src/modules/offers/offer.model");
const Review = require("../../src/modules/reviews/review.model");
const Payment = require("../../src/modules/payments/payment.model");
const Dining = require("../../src/modules/dining/dining.model");
const GalleryItem = require("../../src/modules/gallery/gallery.model");
const Testimonial = require("../../src/modules/testimonials/testimonial.model");
const Faq = require("../../src/modules/faq/faq.model");
const Attraction = require("../../src/modules/attractions/attraction.model");
const HeroBanner = require("../../src/modules/heroBanner/heroBanner.model");
const HomeSettings = require("../../src/modules/homeSettings/homeSettings.model");
const Notification = require("../../src/modules/notifications/notification.model");
const { generateAccessToken, generateRefreshToken } = require("../../src/utils/generateToken");
const { generateBookingId } = require("../../src/utils/slugify");
const { USER_ROLES } = require("../../src/config/constants");

/** A strong password that also passes the auth validator regex. */
const TEST_PASSWORD = "P@ssw0rd_123";

/** Placeholder >=60 chars so the `passwordHash` minlength validation passes; the
 * pre-save hook re-hashes it with bcrypt on persist. */
const PASSWORD_HASH_SEED = "factory-password-hash-seed-0123456789-abcdefghijklmnopqrstuvwxyz";

/** Unique email so parallel suites / repeated runs never collide. */
const uniq = (prefix = "u") => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

const objectId = () => new mongoose.Types.ObjectId();

// ─── Users ────────────────────────────────────────────────────────────────

const userData = (overrides = {}) => ({
  name: "Test User",
  email: uniq("user") + "@test.dev",
  phone: "+91 98765 43210",
  passwordHash: PASSWORD_HASH_SEED,
  role: USER_ROLES.USER,
  isActive: true,
  isEmailVerified: true,
  ...overrides,
});

const createUser = async (overrides = {}) => {
  const doc = await User.create(userData(overrides));
  return doc;
};

const createAdmin = async (overrides = {}) =>
  createUser({ name: "Admin User", role: USER_ROLES.ADMIN, ...overrides });

const createManager = async (overrides = {}) =>
  createUser({ name: "Manager User", role: USER_ROLES.HOTEL_MANAGER, ...overrides });

/** Mint a valid access token for a user regardless of how it was persisted. */
const tokenFor = (user, role = user.role) =>
  generateAccessToken({ id: user._id, role });

/** `{ Authorization: "Bearer <token>" }` header block to pass to supertest. */
const authHeaders = (user, role = user.role) => ({
  Authorization: `Bearer ${tokenFor(user, role)}`,
});

/** A refresh token (both signed and the JWT to store server-side). */
const makeRefreshToken = (userId) => generateRefreshToken({ id: userId });

// ─── Hotels ────────────────────────────────────────────────────────────────

const hotelData = (overrides = {}) => ({
  name: "Luxury Grand Hotel",
  description: "A five-star luxury hotel in the heart of the city.",
  shortDescription: "Five-star luxury near the beach.",
  category: "LUXURY",
  starRating: 5,
  address: {
    street: "1 Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001",
  },
  contact: { email: uniq("hotel") + "@test.dev", phone: "+91 90000 00000" },
  images: [],
  isActive: true,
  isFeatured: false,
  ...overrides,
});

const createHotel = async (overrides = {}) => Hotel.create(hotelData(overrides));

// ─── Rooms ─────────────────────────────────────────────────────────────────

const roomData = (overrides = {}) => ({
  hotel: undefined, // must be supplied by caller or override
  name: "Deluxe King Room",
  type: "DOUBLE",
  description: "A spacious room with a king bed and sea view.",
  maxOccupancy: { adults: 2, children: 1 },
  size: 400,
  bedConfiguration: "1 King",
  basePricePerNight: 10000,
  weekendPremium: 10,
  totalUnits: 5,
  amenities: ["WiFi", "AC"],
  isActive: true,
  isFeatured: false,
  ...overrides,
});

const createRoom = async (hotelOrOverrides, overrides = {}) => {
  const params = hotelOrOverrides && hotelOrOverrides._id
    ? { hotel: hotelOrOverrides._id, ...overrides }
    : { hotel: hotelOrOverrides, ...overrides };
  return Room.create(roomData(params));
};

// ─── Amenities ─────────────────────────────────────────────────────────────

const amenityData = (overrides = {}) => ({
  name: uniq("amenity"),
  description: "A hotel amenity",
  category: "HOTEL",
  image: "https://example.com/amenity.png",
  ...overrides,
});

const createAmenity = (overrides = {}) => Amenity.create(amenityData(overrides));

// ─── Bookings ──────────────────────────────────────────────────────────────

const bookingData = (overrides = {}) => {
  const user = overrides.user || new mongoose.Types.ObjectId();
  const hotel = overrides.hotel || new mongoose.Types.ObjectId();
  const room = overrides.room || new mongoose.Types.ObjectId();
  const checkIn = overrides.checkIn || new Date(Date.now() + 14 * 86400000);
  const checkOut = overrides.checkOut || new Date(checkIn.getTime() + 3 * 86400000);
  const nights = Math.round((checkOut - checkIn) / 86400000);
  return {
    bookingId: generateBookingId(),
    user,
    hotel,
    room,
    checkIn,
    checkOut,
    nights,
    guests: { adults: 2, children: 1 },
    pricing: {
      baseAmount: 30000,
      addonAmount: 0,
      discountAmount: 0,
      taxAmount: 5400,
      totalAmount: 35400,
      currency: "INR",
    },
    guestDetails: {
      name: "Test Guest",
      email: uniq("guest") + "@test.dev",
      phone: "+91 90000 10000",
    },
    status: "PENDING",
    ...overrides,
  };
};

const createBooking = (overrides = {}) => Booking.create(bookingData(overrides));

// ─── Offers ────────────────────────────────────────────────────────────────

const offerData = (overrides = {}) => {
  const now = Date.now();
  return {
    code: uniq("OFF").toUpperCase().slice(0, 12),
    title: "Test Offer",
    type: "FLAT",
    value: 500,
    maxDiscountAmount: 1000,
    minBookingAmount: 0,
    startDate: new Date(now - 86400000),
    endDate: new Date(now + 30 * 86400000),
    usageLimit: 0,
    perUserLimit: 1,
    isActive: true,
    ...overrides,
  };
};

const createOffer = (overrides = {}) => Offer.create(offerData(overrides));

// ─── Reviews ───────────────────────────────────────────────────────────────

const reviewData = (overrides = {}) => ({
  hotel: overrides.hotel || new mongoose.Types.ObjectId(),
  user: overrides.user || new mongoose.Types.ObjectId(),
  booking: overrides.booking || new mongoose.Types.ObjectId(),
  rating: { overall: 5, cleanliness: 5, service: 5, location: 5, value: 4 },
  title: "Excellent stay",
  body: "Wonderful experience, would definitely come back again soon.",
  isVerified: true,
  isActive: true,
  helpfulVotes: 0,
  helpfulVoters: [],
  images: [],
  ...overrides,
});

const createReview = (overrides = {}) => Review.create(reviewData(overrides));

// ─── Payments ──────────────────────────────────────────────────────────────

const paymentData = (overrides = {}) => ({
  booking: overrides.booking || new mongoose.Types.ObjectId(),
  user: overrides.user || new mongoose.Types.ObjectId(),
  razorpayOrderId: overrides.razorpayOrderId || `order_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
  amount: 35400,
  currency: "INR",
  status: "CREATED",
  international: false,
  refunds: [],
  ...overrides,
});

const createPayment = (overrides = {}) => Payment.create(paymentData(overrides));

// ─── Dining ────────────────────────────────────────────────────────────────

const diningData = (overrides = {}) => ({
  title: "Sunset Dinner by the Sea",
  subtitle: "Fine dining",
  description: "A curated dinner experience.",
  hotel: "Luxury Grand Hotel",
  city: "Mumbai",
  image: { url: "https://example.com/dining.jpg", publicId: "dining1" },
  cuisine: "Multi-cuisine",
  rating: 5,
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
  ...overrides,
});

const createDining = (overrides = {}) => Dining.create(diningData(overrides));

// ─── Gallery ───────────────────────────────────────────────────────────────

const galleryData = (overrides = {}) => ({
  title: "Lobby",
  url: "https://example.com/photo.jpg",
  publicId: "gallery1",
  category: "hotel",
  alt: "Hotel lobby",
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
  ...overrides,
});

const createGalleryItem = (overrides = {}) => GalleryItem.create(galleryData(overrides));

// ─── Testimonials ──────────────────────────────────────────────────────────

const testimonialData = (overrides = {}) => ({
  name: "John Doe",
  country: "USA",
  stay: "5 nights",
  rating: 5,
  review: "A truly wonderful stay, attentive staff and great amenities.",
  verified: true,
  sortOrder: 0,
  isActive: true,
  ...overrides,
});

const createTestimonial = (overrides = {}) => Testimonial.create(testimonialData(overrides));

// ─── FAQ ───────────────────────────────────────────────────────────────────

const faqData = (overrides = {}) => ({
  title: "What time is check-in?",
  content: "Check-in begins at 2:00 PM.",
  category: "General",
  sortOrder: 0,
  isActive: true,
  ...overrides,
});

const createFaq = (overrides = {}) => Faq.create(faqData(overrides));

// ─── Attractions ───────────────────────────────────────────────────────────

const attractionData = (overrides = {}) => ({
  name: "Gateway of India",
  description: "A historic monument overlooking the harbour.",
  category: "landmark",
  city: "Mumbai",
  location: { type: "Point", coordinates: [72.8345, 18.922] },
  distance: "2 km",
  address: "Apollo Bandar, Mumbai",
  sortOrder: 0,
  isActive: true,
  ...overrides,
});

const createAttraction = (overrides = {}) => Attraction.create(attractionData(overrides));

// ─── Hero Banner ───────────────────────────────────────────────────────────

const heroBannerData = (overrides = {}) => ({
  title: "Welcome to Luxury Grand",
  eyebrow: "Five Star",
  highlight: "Experience the extraordinary",
  subtitle: "Unforgettable stays await.",
  image: "https://example.com/hero.jpg",
  isActive: true,
  ctaPrimary: { label: "Book Now", href: "/book" },
  ctaSecondary: { label: "Explore", href: "/hotels" },
  ...overrides,
});

const createHeroBanner = (overrides = {}) => HeroBanner.create(heroBannerData(overrides));

// ─── Home Settings ─────────────────────────────────────────────────────────

const homeSettingsData = (overrides = {}) => ({
  key: "home",
  sections: {
    hero: true, experience: true, featuredHotels: true, featuredRooms: true,
    amenities: true, gallery: true, dining: true, offers: true, reviews: true,
    stats: true, map: true, faq: true, newsletter: true, cta: true,
  },
  content: {
    heroEyebrow: "Luxury",
    heroTitle: "Unwind in luxury",
    newsLetterTitle: "Stay connected",
    newsLetterDescription: "Get the best offers.",
    metaDescription: "A luxury hotel booking platform.",
  },
  seo: { title: "Luxury Grand", description: "Book your dream stay." },
  ...overrides,
});

const createHomeSettings = (overrides = {}) => HomeSettings.create(homeSettingsData(overrides));

// ─── Notifications ─────────────────────────────────────────────────────────

const notificationData = (overrides = {}) => ({
  user: overrides.user || new mongoose.Types.ObjectId(),
  type: "GENERAL",
  title: "Welcome",
  message: "Thanks for joining!",
  isRead: false,
  channels: { email: false, sms: false, inApp: true },
  data: {},
  ...overrides,
});

const createNotification = (overrides = {}) => Notification.create(notificationData(overrides));

// ─── Misc ──────────────────────────────────────────────────────────────────

/** Parse a `Set-Cookie` header from supertest agent into { name: value }. */
const parseCookies = (setCookie) => {
  const out = {};
  (setCookie || []).forEach((c) => {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    if (idx > -1) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return out;
};

module.exports = {
  TEST_PASSWORD,
  PASSWORD_HASH_SEED,
  uniq,
  objectId,
  userData,
  createUser,
  createAdmin,
  createManager,
  tokenFor,
  authHeaders,
  makeRefreshToken,
  hotelData,
  createHotel,
  roomData,
  createRoom,
  amenityData,
  createAmenity,
  bookingData,
  createBooking,
  offerData,
  createOffer,
  reviewData,
  createReview,
  paymentData,
  createPayment,
  diningData,
  createDining,
  galleryData,
  createGalleryItem,
  testimonialData,
  createTestimonial,
  faqData,
  createFaq,
  attractionData,
  createAttraction,
  heroBannerData,
  createHeroBanner,
  homeSettingsData,
  createHomeSettings,
  notificationData,
  createNotification,
  parseCookies,
};