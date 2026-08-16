/**
 * AureliaStay AI Agent — orchestrates intent parsing, database queries and the
 * OpenRouter natural-language fallback.
 *
 * Rule #1: factual booking data (hotels, rooms, prices, availability, offers,
 * policies) ALWAYS comes from the database via the existing domain services.
 * OpenRouter is used ONLY for conversational replies where no structured
 * database answer applies. The agent never invents inventory.
 */
const axios = require("axios");
const logger = require("../../config/logger");

const hotelService = require("../hotels/hotel.service");
const roomService = require("../rooms/room.service");
const offerService = require("../offers/offer.service");
const pricingService = require("../../services/pricing.service");
const availabilityService = require("../../services/availability.service");
const { parseIntent, extractRange } = require("./ai.intent");

const HOTEL = require("../hotels/hotel.model");
const ROOM = require("../rooms/room.model");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_HOTELS = 5;
const MAX_ROOMS = 6;

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const SYSTEM_PROMPT = `You are AureliaStay Concierge — the AI concierge of ${process.env.BRAND_NAME || "AureliaStay"}, a luxury hotel booking platform.

You help guests with:
- Searching hotels by city, dates, guests, price, rating, category, amenities and availability.
- Recommending hotels and rooms based on real inventory.
- Explaining rooms, amenities, offers, pricing, and booking/cancellation policies.
- Guiding guests toward making a booking.

Rules:
- ONLY ever describe hotels, rooms, prices or availability that were provided to you in the conversation or that you know are queried from the live database.
- NEVER invent hotel names, room types, prices, discounts or availability.
- If the user needs live data (search, prices, availability, offers), ask them to use the search tools or rephrase with a city / dates, then point them to the structured results the system returns.
- Be concise and premium: short sentences, bullet points, a warm but refined tone.
- If asked about booking or cancellation policy, refer guests to the policy shown on the booking page and the help centre.
- Always respond in English.`;

class AiService {
  /**
   * Handle one chat message and return a structured response.
   * @param {string} message
   * @returns {Promise<object>} { type, message, hotels?, rooms?, offers?, reply?, query? }
   */
  async handleChat(message) {
    const parsed = parseIntent(message);
    const { intent, filters } = parsed;

    // Price range "between X and Y" needs both bounds — fold it into filters.
    extractRange(parsed.original, filters);

    switch (intent) {
      case "GREETING":
        return this._greeting();
      case "GENERAL":
        return this._fallback(message);
      case "BOOKING_HELP":
        return this._bookingHelp();
      case "OFFERS":
        return this._offers();
      case "POLICIES":
        return this._policies(parsed);
      case "AMENITIES":
        return this._amenities(parsed);
      case "PRICING":
        return this._pricing(parsed);
      case "RECOMMEND":
        return this._recommend(parsed);
      case "HOTEL_ROOMS":
        return this._rooms(parsed);
      case "SEARCH_HOTELS":
      default:
        return this._searchHotels(parsed);
    }
  }

  // ─── Intent handlers ──────────────────────────────────────────────────────

  _greeting() {
    return {
      type: "reply",
      message:
        "Welcome to AureliaStay Concierge. I can help you find the perfect luxury stay — just tell me a city, your dates, guests or budget. Try “luxury hotels in Goa for 2 adults under ₹15,000”.",
      suggestions: ["Luxury hotels in Goa", "Hotels under ₹10,000", "5 star hotels with a pool", "Show me current offers"],
    };
  }

  async _searchHotels(parsed) {
    const { filters } = parsed;
    const query = this._buildHotelQuery(filters, { sort: filters.sort || "recommended" });

    const { hotels } = await hotelService.getHotels(query);

    // Filter to genuinely available rooms when dates were supplied.
    let available = hotels;
    if (filters.checkIn && filters.checkOut) {
      available = hotels.filter((h) => (h.availableRooms ?? 0) > 0);
    }

    if (!available.length) {
      return {
        type: "reply",
        message: this._noResultsMessage(parsed),
        query,
      };
    }

    return {
      type: "hotels",
      message: this._hotelsMessage(available.length, filters),
      hotels: this._shapeHotels(available.slice(0, MAX_HOTELS)),
      query,
    };
  }

  async _recommend(parsed) {
    const { filters } = parsed;
    const query = this._buildHotelQuery(filters, { sort: "recommended" });
    const { hotels } = await hotelService.getHotels(query);
    const picks = (hotels || []).slice(0, MAX_HOTELS);

    if (!picks.length) {
      return { type: "reply", message: this._noResultsMessage(parsed), query };
    }

    return {
      type: "hotels",
      message:
        "Based on guest ratings and your preferences, these are my top recommendations:",
      hotels: this._shapeHotels(picks),
      query,
    };
  }

  async _rooms(parsed) {
    const { hotelName, roomType, filters } = parsed;

    // Try to resolve an explicit hotel reference first.
    const hotel = await this._resolveHotel(hotelName, filters.destination);
    if (hotel) {
      const { rooms } = await roomService.getRoomsByHotel(hotel._id, {
        type: roomType || undefined,
        adults: filters.guests?.adults,
      });
      const shaped = this._shapeRooms(rooms, hotel);
      if (!shaped.length) {
        return {
          type: "reply",
          message: `I couldn't find active rooms${roomType ? ` of that type` : ""} at ${hotel.name} right now. Would you like me to suggest a similar hotel?`,
        };
      }
      return {
        type: "rooms",
        message: `Here are the room options at ${hotel.name}:`,
        hotel: this._shapeHotelLite(hotel),
        rooms: shaped.slice(0, MAX_ROOMS),
      };
    }

    // No hotel named — surface room options from top matching hotels.
    const query = this._buildHotelQuery(filters, { sort: "recommended" });
    const { hotels } = await hotelService.getHotels(query);
    const top = (hotels || []).slice(0, 2);

    if (!top.length) {
      return { type: "reply", message: this._noResultsMessage(parsed), query };
    }

    const rooms = [];
    for (const h of top) {
      const { rooms: r } = await roomService.getRoomsByHotel(h._id, {
        type: roomType || undefined,
        adults: filters.guests?.adults,
      });
      rooms.push(...this._shapeRooms(r, h));
    }

    return {
      type: "rooms",
      message: `Here are room options from top stays matching your request:`,
      hotels: this._shapeHotels(top),
      rooms: rooms.slice(0, MAX_ROOMS),
      query,
    };
  }

  async _offers() {
    const { offers } = await offerService.getActiveOffers({ limit: 6 });
    if (!offers.length) {
      return {
        type: "reply",
        message: "There are no active offers right now. Check back soon for seasonal promotions.",
      };
    }
    return {
      type: "offers",
      message: "Here are the current offers at AureliaStay:",
      offers: this._shapeOffers(offers),
    };
  }

  async _policies(parsed) {
    const hotel = await this._resolveHotel(parsed.hotelName, parsed.filters.destination);
    if (!hotel) {
      return {
        type: "reply",
        message:
          "Each hotel sets its own policies. Generally: check-in from 2 PM, check-out by noon, and free cancellation up to 24 hours before arrival. Tell me a hotel name and I'll share its exact policy.",
      };
    }
    const p = hotel.policies || {};
    return {
      type: "hotel",
      message: `Policies at ${hotel.name}:`,
      hotel: this._shapeHotelLite(hotel),
      reply: [
        `• Check-in: ${p.checkIn || "from 14:00"}`,
        `• Check-out: ${p.checkOut || "by 12:00"}`,
        `• Cancellation: ${p.cancellation || "Free cancellation up to 24 hours before check-in."}`,
        p.petsAllowed ? "• Pets are welcome." : "• Pets are not permitted.",
        p.smokingAllowed ? "• Smoking is permitted in designated areas." : "• This is a non-smoking property.",
        p.childrenAllowed === false ? "• Not suitable for children." : "• Children are welcome.",
      ].join("\n"),
    };
  }

  async _amenities(parsed) {
    const hotel = await this._resolveHotel(parsed.hotelName, parsed.filters.destination);
    if (!hotel) {
      // Show the global amenities catalogue as a fallback.
      const Amenity = require("../amenities/amenity.model");
      const amenities = await Amenity.find().select("name category").sort("name").limit(20).lean();
      return {
        type: "reply",
        message:
          "AureliaStay properties offer pools, spas, fine dining, Wi-Fi, fitness centres and more. Tell me a hotel name and I'll list exactly what it has.",
        amenities: amenities.map((a) => a.name),
      };
    }

    const names = (hotel.amenities || []).map((a) => (typeof a === "string" ? a : a.name)).filter(Boolean);
    const roomNames = await this._hotelRoomAmenities(hotel._id);

    return {
      type: "hotel",
      message: `Amenities at ${hotel.name}:`,
      hotel: this._shapeHotelLite(hotel),
      amenities: [...new Set([...names, ...roomNames])],
    };
  }

  async _pricing(parsed) {
    const { hotelName, roomType, filters } = parsed;
    const hotel = await this._resolveHotel(hotelName, filters.destination);

    let checkIn = filters.checkIn;
    let checkOut = filters.checkOut;
    if (!checkIn || !checkOut) {
      const base = new Date();
      base.setHours(12, 0, 0, 0);
      checkIn = base.toISOString().split("T")[0];
      const end = new Date(base);
      end.setDate(end.getDate() + 1);
      checkOut = end.toISOString().split("T")[0];
    }

    const roomQuery = {};
    if (roomType) roomQuery.type = roomType;
    if (hotel) roomQuery.hotel = hotel._id;

    const room = await ROOM.findOne({ isActive: true, ...roomQuery })
      .sort({ basePricePerNight: 1 })
      .lean();

    if (!room) {
      return {
        type: "reply",
        message: hotel
          ? `I couldn't find a matching room at ${hotel.name}. Would you like to see all its rooms?`
          : "I couldn't find pricing for that yet. Try “price of suites at <hotel>” or “rooms under ₹10,000 in Goa”.",
      };
    }

    const pricing = pricingService.calculateBookingPrice(room, checkIn, checkOut);
    const availability = await availabilityService
      .getRoomAvailability(room._id, checkIn, checkOut, room)
      .catch(() => null);

    const hotelNameStr = hotel ? hotel.name : (room.hotelName || "this property");

    return {
      type: "rooms",
      message: `${hotelNameStr} · ${room.name} — from ${INR_FORMATTER.format(room.basePricePerNight)} per night. Here's a ${pricing.nights}-night estimate:`,
      rooms: [
        {
          ...this._shapeRoom(room),
          pricePerNight: room.basePricePerNight,
          priceLabel: INR_FORMATTER.format(room.basePricePerNight),
          estimate: {
            nights: pricing.nights,
            baseAmount: pricing.baseAmount,
            taxAmount: pricing.taxAmount,
            totalAmount: pricing.totalAmount,
            currency: "INR",
          },
          isAvailable: availability ? availability.isAvailable : true,
          availableUnits: availability ? availability.availableUnits : room.totalUnits,
        },
      ],
      query: { checkIn, checkOut },
    };
  }

  async _bookingHelp() {
    return {
      type: "reply",
      message:
        "Booking with AureliaStay is simple:\n\n1. Search for a hotel by city and dates.\n2. Choose a room and confirm your stay.\n3. Add any guest details and apply an offer code if you have one.\n4. Pay securely via card, UPI or net-banking.\n5. Your confirmation is sent by email.\n\nMost stays can be cancelled free of charge up to 24 hours before check-in. May I help you find a hotel to begin?",
      suggestions: ["Find me a luxury hotel in Goa", "Show suites under ₹12,000", "Do you have offers?"],
    };
  }

  // ─── Database resolution helpers ──────────────────────────────────────────

  /**
   * Build the hotel listing query from parsed filters. Reuses HotelService so
   * availability, starting-price and amenity logic stay in one place.
   */
  _buildHotelQuery(filters, extra = {}) {
    const query = { page: 1, limit: 20 };
    if (filters.destination) query.destination = filters.destination;
    if (filters.checkIn) query.checkIn = filters.checkIn;
    if (filters.checkOut) query.checkOut = filters.checkOut;
    if (filters.minPrice) query.minPrice = filters.minPrice;
    if (filters.maxPrice) query.maxPrice = filters.maxPrice;
    if (filters.minRating) query.minRating = filters.minRating;
    if (filters.category) query.category = filters.category;
    if (filters.guests?.adults) query.guests = filters.guests.adults;
    if (extra.sort) query.sort = extra.sort;
    return query;
  }

  /**
   * Resolve a hotel reference from a message. Tries (in order) an exact name
   * match, a word-subset match, then a destination fallback.
   */
  async _resolveHotel(hotelName, destination) {
    if (hotelName) {
      const regex = new RegExp(this._escapeRegex(hotelName), "i");
      const byName = await HOTEL.findOne({ name: regex, isActive: true }).lean();
      if (byName) return byName;
    }
    if (destination) {
      const byCity = await HOTEL.findOne({ isActive: true, "address.city": new RegExp(this._escapeRegex(destination), "i") })
        .sort({ avgRating: -1 })
        .lean();
      if (byCity) return byCity;
    }
    return null;
  }

  async _hotelRoomAmenities(hotelId) {
    const rooms = await ROOM.find({ hotel: hotelId, isActive: true }).select("amenities").limit(12).lean();
    const set = new Set();
    rooms.forEach((r) => (r.amenities || []).forEach((a) => set.add(a)));
    return [...set];
  }

  _escapeRegex(str) {
    return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ─── Shaping helpers ──────────────────────────────────────────────────────

  _shapeHotels(hotels) {
    return (hotels || []).map((h) => ({
      _id: h._id,
      name: h.name,
      slug: h.slug,
      category: h.category,
      starRating: h.starRating,
      avgRating: h.avgRating,
      totalReviews: h.totalReviews,
      city: h.address?.city || "",
      state: h.address?.state || "",
      shortDescription: h.shortDescription || "",
      startingPrice: h.startingPrice,
      priceLabel: h.startingPrice ? INR_FORMATTER.format(h.startingPrice) : null,
      availableRooms: h.availableRooms,
      image: h.images?.[0]?.url || null,
      amenities: (h.amenities || []).map((a) => (typeof a === "string" ? a : a.name)),
    }));
  }

  _shapeHotelLite(hotel) {
    return {
      _id: hotel._id,
      name: hotel.name,
      slug: hotel.slug,
      category: hotel.category,
      starRating: hotel.starRating,
      city: hotel.address?.city || "",
      image: hotel.images?.[0]?.url || null,
    };
  }

  _shapeRooms(rooms, hotel) {
    return (rooms || []).map((r) => this._shapeRoom(r, hotel));
  }

  _shapeRoom(r, hotel) {
    const capacity = r.maxOccupancy || {};
    return {
      _id: r._id,
      name: r.name,
      type: r.type,
      view: r.view,
      size: r.size,
      bedConfiguration: r.bedConfiguration,
      amenities: r.amenities || [],
      pricePerNight: r.basePricePerNight,
      priceLabel: INR_FORMATTER.format(r.basePricePerNight),
      totalUnits: r.totalUnits,
      maxGuests: (capacity.adults || 0) + (capacity.children || 0),
      image: r.images?.[0]?.url || null,
      hotelName: hotel?.name || (r.hotel?.name || null),
      hotelId: hotel?._id || (r.hotel?._id || null),
      hotelSlug: hotel?.slug || (r.hotel?.slug || null),
    };
  }

  _shapeOffers(offers) {
    return (offers || []).map((o) => ({
      _id: o._id,
      code: o.code,
      title: o.title,
      description: o.description || "",
      type: o.type,
      value: o.value,
      minBookingAmount: o.minBookingAmount,
      banner: o.banner?.url || null,
      endDate: o.endDate,
    }));
  }

  // ─── Message copy ─────────────────────────────────────────────────────────

  _hotelsMessage(count, filters) {
    const parts = [];
    if (filters.destination) parts.push(`in ${filters.destination}`);
    if (filters.checkIn && filters.checkOut) parts.push(`${filters.checkIn} → ${filters.checkOut}`);
    if (filters.guests?.adults) parts.push(`for ${filters.guests.adults} guest(s)`);
    if (filters.category) parts.push(filters.category.toLowerCase());
    if (filters.maxPrice) parts.push(`under ${INR_FORMATTER.format(filters.maxPrice)}`);
    const ctx = parts.length ? ` ${parts.join(", ")}` : "";
    return `I found ${count} match${count === 1 ? "" : "es"}${ctx}:`;
  }

  _noResultsMessage(parsed) {
    const { filters } = parsed;
    const ctx = [];
    if (filters.destination) ctx.push(filters.destination);
    if (filters.checkIn && filters.checkOut) ctx.push(`${filters.checkIn} → ${filters.checkOut}`);
    if (filters.category) ctx.push(filters.category.toLowerCase());
    if (filters.maxPrice) ctx.push(`under ${INR_FORMATTER.format(filters.maxPrice)}`);
    const where = ctx.length ? ` for ${ctx.join(", ")}` : "";
    return `I couldn't find any stays${where} right now. Would you like me to broaden the search — a different city, higher budget, or flexible dates?`;
  }

  // ─── OpenRouter fallback ──────────────────────────────────────────────────

  async _fallback(message) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        type: "reply",
        message:
          "I'm not sure I understood that. I'm best with hotel searches — try “luxury hotels in Mumbai”, “rooms under ₹10,000” or “current offers”.",
        suggestions: ["Luxury hotels in Goa", "Hotels under ₹10,000", "Show me current offers"],
      };
    }

    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: process.env.OPENROUTER_MODEL || "openrouter/free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          temperature: 0.4,
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error("Empty OpenRouter response.");

      return { type: "reply", message: reply };
    } catch (error) {
      logger.warn(`OpenRouter fallback failed: ${error.message}`);
      return {
        type: "reply",
        message:
          "I can help you find a perfect stay — tell me a city, dates, guests or budget, and I'll pull live options for you. For anything else, our team is a message away.",
      };
    }
  }
}

module.exports = new AiService();