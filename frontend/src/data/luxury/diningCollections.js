/**
 * Dining collection content for the Aurelia Stay brand pages — Restaurants,
 * Buffet, Chef's Table, Private Dining, Bars & Lounges and Rooftop Dining.
 * Each entry is a dedicated page with genuinely distinct content.
 */
import { getFallbackAsset } from "@/constants/assets";

const galleryImages = (indices) =>
  indices.map((i) => ({
    src: getFallbackAsset("gallery", i),
    alt: "Aurelia Stay dining moment",
  }));

export const DINING_COLLECTIONS = [
  {
    id: "restaurants",
    seo: {
      title: "Restaurants | AureliaStay",
      description:
        "Signature restaurants at AureliaStay — chef-led dining rooms, tasting menus, open kitchens, international cuisine, seasonal menus and garden tables.",
    },
    hero: {
      eyebrow: "Dining · Restaurants",
      title: "Exceptional Dining",
      description:
        "A constellation of restaurants, each with its own voice — tasting menus, open-fire grills, gardens to table and kitchens that chase the season. All of it, our best.",
      image: getFallbackAsset("dining", 0),
    },
    intro: {
      eyebrow: "The Dining Rooms",
      title: "Tables where the kitchen shows off",
      description:
        "From the chef's tasting counter to the grand dining room, our restaurants treat every meal as an occasion. Produce from our own gardens, seafood landed that morning, and wine lists that know no limits.",
      image: getFallbackAsset("dining", 1),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your restaurant",
      description:
        "Six rooms, six voices, one standard.",
      cols: 3,
      items: [
        {
          title: "Signature Restaurants",
          meta: "Fine Dining",
          description:
            "Chef-led dining rooms with tasting menus, open kitchens and seasonal produce.",
          poster: getFallbackAsset("dining", 0),
        },
        {
          title: "Open-Fire & Grill",
          meta: "Fire",
          description:
            "Robata, tandoor and open flames — the kitchen's oldest technology, perfected.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Chef-Led Menus",
          meta: "Tasting",
          description:
            "Five to nine course menus composed around the season and the market.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "International Cuisine",
          meta: "Global",
          description:
            "Pan-Asian, Mediterranean and Indian kitchens under one roof.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "Seasonal Menus",
          meta: "Seasonal",
          description:
            "Menus that change with the harvest, the monsoon and the coast.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Garden Tables",
          meta: "Al Fresco",
          description:
            "Long lunches and candlelit dinners in our edible gardens.",
          poster: getFallbackAsset("gallery", 5),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Restaurant",
      title: "A Seat at the Open Kitchen",
      description:
        "The tasting counter at the heart of the kitchen. Plates pass hand to hand as chefs build each course, narrating the fire, the season and the gamble they took with the menu.",
      image: getFallbackAsset("dining", 2),
      points: [
        "Counter seats at the pass",
        "Seasonal tasting menu",
        "Cellar wine pairing",
        "Menu keepsake to take home",
      ],
    },
    amenities: {
      eyebrow: "Dining Amenities",
      title: "Everything a great meal deserves",
      description:
        "Chefs, cellars and a service team that moves like clockwork.",
      items: [
        { icon: "utensils", title: "Signature restaurants", description: "Chef-led rooms with tasting menus and open kitchens." },
        { icon: "star", title: "Chef-led menus", description: "Menus composed around the season and the market." },
        { icon: "wine", title: "Cellar pairings", description: "Wine lists and pairings from our deep cellars." },
        { icon: "sparkles", title: "Seasonal menus", description: "Changing with the harvest, monsoon and coast." },
        { icon: "clock", title: "Reservations", description: "Priority bookings for in-house guests." },
        { icon: "flame", title: "Open-fire kitchen", description: "Robata, tandoor and grill theatre at the pass." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Dining, in colour",
      description:
        "Open kitchens, long tables and plates that leave a memory.",
      images: galleryImages([0, 1, 2, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your dinner",
      title: "A table worth dressing for",
      description:
        "Reserve at one of our restaurants — our maître d' will arrange the best table and the evening.",
    },
  },
  {
    id: "buffet",
    seo: {
      title: "Buffet Dining | AureliaStay",
      description:
        "Luxury buffet dining at AureliaStay — breakfast, lunch and dinner buffets with live stations, regional spreads, dessert tables and family-friendly evenings.",
    },
    hero: {
      eyebrow: "Dining · Buffet",
      title: "A Spread to Remember",
      description:
        "Long marble counters, live stations and a buffet that quietly became legendary. Breakfast, lunch and dinner — regional spreads, global classics and dessert tables that run all evening.",
      image: getFallbackAsset("dining", 1),
    },
    intro: {
      eyebrow: "The Buffet Hall",
      title: "Every craving, in reach",
      description:
        "Fresh stations turn out dosas, dim sum and crepes to order; carving counters and live grills stand ready; and the dessert room waits for those who saved room. Children welcome, all evening.",
      image: getFallbackAsset("dining", 0),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your service",
      description:
        "Three sittings, one legendary spread.",
      cols: 3,
      items: [
        {
          title: "Breakfast Buffet",
          meta: "Morning",
          description:
            "Fresh juices, live egg stations, regional breads and a honey room.",
          poster: getFallbackAsset("dining", 0),
        },
        {
          title: "Lunch Buffet",
          meta: "Midday",
          description:
            "Regional thalis, global favourites and a salad room in season.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Dinner Buffet",
          meta: "Evening",
          description:
            "Live grills, carving counters and dessert tables that run late.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "Live Stations",
          meta: "Fresh",
          description:
            "Dosas, dim sum and pasta turned out in front of you.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "Regional Spreads",
          meta: "Heritage",
          description:
            "The coast on your plate — local grains, curries and sweets.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Family Evenings",
          meta: "Together",
          description:
            "Kids' counters, early sittings and a dessert room everyone agrees on.",
          poster: getFallbackAsset("gallery", 5),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Buffet",
      title: "The Grand Dinner Spread",
      description:
        "An evening procession of stations — the carving counter, the live grill, the thali bar, the chaat cart — closing with a dessert room that defies restraint. Come hungry; leave impressed.",
      image: getFallbackAsset("dining", 1),
      points: [
        "Live grill & carving",
        "Regional thali bar",
        "Dessert room to finish",
        "Kids' counters early",
      ],
    },
    amenities: {
      eyebrow: "Buffet Amenities",
      title: "A hall made for abundance",
      description:
        "Stations, staff and space for every appetite.",
      items: [
        { icon: "utensils", title: "Live stations", description: "Dosas, dim sum and pasta, turned out fresh." },
        { icon: "flame", title: "Carving counters", description: "Roasts carved to order through the evening." },
        { icon: "leaf", title: "Regional spreads", description: "Local grains, curries and heritage sweets." },
        { icon: "baby", title: "Kids' counters", description: "Friendly plates and early sittings." },
        { icon: "clock", title: "Three sittings", description: "Breakfast, lunch and dinner, all day." },
        { icon: "sparkles", title: "Dessert rooms", description: "A room given over entirely to sweet." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Abundance, arranged",
      description:
        "Long counters, live flames and tables that groan beautifully.",
      images: galleryImages([1, 2, 3, 4, 5, 6, 0]),
    },
    cta: {
      eyebrow: "Begin your buffet",
      title: "Come with an appetite",
      description:
        "Reserve a table at the buffet — our chefs will have the stations at full readiness.",
    },
  },
  {
    id: "chefs-table",
    seo: {
      title: "The Chef's Table | AureliaStay",
      description:
        "Exclusive chef-led dining at AureliaStay — the chef's table, eight-course tasting menus, table-side plating, narrated courses and cellar pairings.",
    },
    hero: {
      eyebrow: "Dining · The Chef's Table",
      title: "The Best Seat in the House",
      description:
        "Eight courses, plated table-side in the heat of the kitchen, narrated by the chef who composed them. The most sought-after seats in the house — and the most memorable meal you will have here.",
      image: getFallbackAsset("dining", 2),
    },
    intro: {
      eyebrow: "At the Pass",
      title: "Dine where the dinner is made",
      description:
        "A counter at the edge of the kitchen, a menu written that morning, a chef who plates each course in front of you. Every night is one long performance — and you hold the best seat.",
      image: getFallbackAsset("dining", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your seating",
      description:
        "Four ways to sit at the chef's side.",
      cols: 3,
      items: [
        {
          title: "The Signature Table",
          meta: "Eight Courses",
          description:
            "A full tasting menu narrated course by course at the pass.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "The Kitchen Counter",
          meta: "Front Row",
          description:
            "Seats facing the flames, the garde-manger and the plated pass.",
          poster: getFallbackAsset("dining", 0),
        },
        {
          title: "Market Menus",
          meta: "That Morning",
          description:
            "Menus written from the day's market — the kitchen's gamble, your gain.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Table-Side Theatre",
          meta: "In Front of You",
          description:
            "Carving, flambé and final touches performed at your counter.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Cellar Pairings",
          meta: "The Sommelier",
          description:
            "Wines chosen course by course to match the plates.",
          poster: getFallbackAsset("gallery", 5),
        },
        {
          title: "The Private Table",
          meta: "Reserved",
          description:
            "The entire counter booked for your party alone.",
          poster: getFallbackAsset("gallery", 0),
        },
      ],
    },
    featured: {
      eyebrow: "The Signature Table",
      title: "Eight Courses, Narrated",
      description:
        "An evening in the chef's hands — a market menu, a sommelier's pairing for each plate, and the chef at your counter telling you exactly why each dish is built this way.",
      image: getFallbackAsset("dining", 2),
      points: [
        "Eight-course tasting menu",
        "Narrated by the chef",
        "Sommelier pairings",
        "Menu keepsake to take home",
      ],
    },
    amenities: {
      eyebrow: "Chef's Table Amenities",
      title: "A theatre of taste",
      description:
        "The kitchen, the pass and the pours.",
      items: [
        { icon: "utensils", title: "Chef-led menus", description: "Menus composed and narrated at the pass." },
        { icon: "flame", title: "Table-side theatre", description: "Carving, flambé and plating before you." },
        { icon: "wine", title: "Cellar pairings", description: "Sommelier pours matched course by course." },
        { icon: "sparkles", title: "Market menus", description: "Written from the day's market, daily." },
        { icon: "star", title: "Signature counter", description: "Eight courses of the chef's choosing." },
        { icon: "users", title: "Private bookings", description: "The full counter, reserved for your party." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Behind the pass",
      description:
        "Flames, plating hands and courses that arrive like acts.",
      images: galleryImages([2, 3, 4, 5, 6, 0, 1]),
    },
    cta: {
      eyebrow: "Begin your evening",
      title: "The best seat, reserved",
      description:
        "Reserve the Chef's Table — our kitchen will write the menu around the market and you.",
    },
  },
  {
    id: "private",
    seo: {
      title: "Private Dining Rooms | AureliaStay",
      description:
        "Personalized private dining at AureliaStay — private dining rooms, villa dining, romantic dinners, celebration dining, boardroom dinners and bespoke menus.",
    },
    hero: {
      eyebrow: "Dining · Private",
      title: "A Table That Is Yours Alone",
      description:
        "A room that is yours alone, a menu written for your table, a sommelier who has already chosen the wines. Personalized private dining at AureliaStay turns any occasion into an event.",
      image: getFallbackAsset("gallery", 4),
    },
    intro: {
      eyebrow: "The Private Rooms",
      title: "Every seat, yours",
      description:
        "Bespoke menus, dedicated staff and rooms that range from intimate for two to grand for a hundred. Anniversaries, proposals, board dinners — compose it, and we will stage it.",
      image: getFallbackAsset("dining", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your setting",
      description:
        "Four ways to own the room.",
      cols: 3,
      items: [
        {
          title: "Private Dining Rooms",
          meta: "Private",
          description:
            "Elegant rooms with dedicated staff, from intimate to grand.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Villa Dining",
          meta: "In Residence",
          description:
            "A chef and team bring the full restaurant experience to your villa.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "Romantic Dinners",
          meta: "For Two",
          description:
            "Candlelit tables, curated menus and proposals staged to perfection.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "Celebration Dining",
          meta: "Occasions",
          description:
            "Birthdays, anniversaries and milestones — from cakes to fireworks.",
          poster: getFallbackAsset("gallery", 5),
        },
        {
          title: "Boardroom Dinners",
          meta: "Business",
          description:
            "Discreet rooms for clients, launches and dinners that close deals.",
          poster: getFallbackAsset("gallery", 0),
        },
        {
          title: "Bespoke Menus",
          meta: "Tailored",
          description:
            "Menus written from scratch around your tastes and dietary needs.",
          poster: getFallbackAsset("gallery", 1),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Setting",
      title: "The Proposal Table",
      description:
        "A private room dressed in candlelight, a menu written for two, a ring hidden in the dessert course and a photographer waiting outside. We have done this many times — each one, entirely new.",
      image: getFallbackAsset("gallery", 4),
      points: [
        "Private candlelit room",
        "Bespoke menu & pairings",
        "Flowers, music & staging",
        "Discreet photography",
      ],
    },
    amenities: {
      eyebrow: "Private Dining Amenities",
      title: "Everything for an occasion",
      description:
        "Rooms, staff and staging for moments worth marking.",
      items: [
        { icon: "utensils", title: "Private dining rooms", description: "Elegant rooms with dedicated staff." },
        { icon: "sparkles", title: "Bespoke menus", description: "Menus written entirely for your table." },
        { icon: "star", title: "Romantic dinners", description: "Candlelit settings staged for two." },
        { icon: "wine", title: "Cellar pairings", description: "Sommelier-led wines for every course." },
        { icon: "moon", title: "Evening ambience", description: "Lighting, music and atmosphere, composed." },
        { icon: "users", title: "Celebration dining", description: "Occasions staged from cake to fireworks." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Evenings, yours alone",
      description:
        "Candlelit rooms, staged proposals and tables that belong only to you.",
      images: galleryImages([1, 2, 3, 4, 5, 6, 0]),
    },
    cta: {
      eyebrow: "Begin your private evening",
      title: "The occasion, fully yours",
      description:
        "Reserve a private room — our events team will compose the menu, staging and details.",
    },
  },
  {
    id: "bars",
    seo: {
      title: "Bars & Lounges | AureliaStay",
      description:
        "Evenings worth lingering at AureliaStay — cocktail lounges, champagne bars, the whisky room, pool bar, sunset lounge and signature cocktails.",
    },
    hero: {
      eyebrow: "Dining · Bars & Lounges",
      title: "Evenings Worth Lingering",
      description:
        "Low amber light, a menu of signatures and seats that never hurry you. Our bars and lounges are where the evening turns into a story — one round at a time.",
      image: getFallbackAsset("gallery", 1),
    },
    intro: {
      eyebrow: "The Lounges",
      title: "Stay a while longer",
      description:
        "A lounge for every mood — the quiet whisky room, the shimmer of the champagne bar, the pool bar at noon and the sunset lounge where the day ends well. Cocktails composed, never rushed.",
      image: getFallbackAsset("dining", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your last call",
      description:
        "Six lounges, six moods, one standard of pour.",
      cols: 3,
      items: [
        {
          title: "Cocktail Lounges",
          meta: "Signature Cocktails",
          description:
            "Award-winning mixes, tableside preparations and a menu of house signatures.",
          poster: getFallbackAsset("dining", 0),
        },
        {
          title: "Champagne Bars",
          meta: "Bubbles",
          description:
            "By-the-glass pours and rare vintages in a room of gold and glass.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "The Whisky Room",
          meta: "Whisky",
          description:
            "A wall of rare single malts, leather chairs and cigar service.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "Pool Bar",
          meta: "Poolside",
          description:
            "Frozen classics and light bites served from the water's edge.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "Sunset Lounge",
          meta: "Evening",
          description:
            "Open-air seats timed to the golden hour, with live acoustic sets.",
          poster: getFallbackAsset("gallery", 2),
        },
        {
          title: "Signature Cocktails",
          meta: "House Creations",
          description:
            "Drinks invented here and nowhere else, named for the coast.",
          poster: getFallbackAsset("gallery", 3),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Lounge",
      title: "The Whisky Room",
      description:
        "A quiet cathedral of oak and amber. Two hundred single malts line the wall; the sommelier of spirits pours you the story of each one, and the evening does the rest.",
      image: getFallbackAsset("dining", 2),
      points: [
        "200+ single malts",
        "Private cigar & tasting room",
        "Guided dram journeys",
        "Evening jazz on Fridays",
      ],
    },
    amenities: {
      eyebrow: "Lounge Amenities",
      title: "Poured with intention",
      description:
        "Bars worth writing home about.",
      items: [
        { icon: "wine", title: "Signature cocktails", description: "House creations, invented here." },
        { icon: "clock", title: "Late hours", description: "Lounges that stay open for the night owl." },
        { icon: "sparkles", title: "Champagne bars", description: "Rare pours in rooms of gold and glass." },
        { icon: "flame", title: "Whisky room", description: "Rare malts, leather and cigar service." },
        { icon: "moon", title: "Sunset lounge", description: "Open-air seats timed to the golden hour." },
        { icon: "star", title: "Evening music", description: "Acoustic sets and jazz into the night." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Amber hours",
      description:
        "Low light, perfect pours and evenings that refuse to end.",
      images: galleryImages([2, 1, 0, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your evening",
      title: "One more round",
      description:
        "Reserve a table at the bar — our bartenders will have a signature waiting.",
    },
  },
  {
    id: "rooftop",
    seo: {
      title: "Rooftop Dining | AureliaStay",
      description:
        "Dine above the city at AureliaStay — rooftop restaurant, sunset dining, sky lounge, private cabanas, city views and evening experiences.",
    },
    hero: {
      eyebrow: "Dining · Rooftop",
      title: "Dine Above the City",
      description:
        "The city at your feet, the sky above your table. Our rooftop restaurant turns dinner into a panorama — sunset dining, sky lounges and the skyline glittering all around.",
      image: getFallbackAsset("gallery", 0),
    },
    intro: {
      eyebrow: "The Rooftop Rooms",
      title: "A table among the towers",
      description:
        "Elevated, open and unforgettable. Watch the city change light as you dine, retire to the sky lounge for cocktails, or claim a private cabana for the whole evening.",
      image: getFallbackAsset("dining", 0),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your altitude",
      description:
        "Four ways to dine above everything.",
      cols: 3,
      items: [
        {
          title: "Rooftop Restaurant",
          meta: "Fine Dining",
          description:
            "Chef-led menus with the skyline as the fourth course.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Sunset Dining",
          meta: "Golden Hour",
          description:
            "An early seating timed perfectly to the fall of light.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "Sky Lounge",
          meta: "Cocktails",
          description:
            "Open-air seats, city views and cocktails after dark.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "Private Cabanas",
          meta: "Private",
          description:
            "Semi-private pavilions with dedicated servers and their own views.",
          poster: getFallbackAsset("gallery", 1),
        },
        {
          title: "City Views",
          meta: "Panorama",
          description:
            "Every seat a vantage point over the glittering streets.",
          poster: getFallbackAsset("gallery", 2),
        },
        {
          title: "Evening Experiences",
          meta: "Night",
          description:
            "Live music, tasting flights and late-night small plates.",
          poster: getFallbackAsset("gallery", 3),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Evening",
      title: "Sunset for Two, Above the City",
      description:
        "The last golden light, a private cabana, a sommelier's pairing and the city coming alive beneath you. The most requested table in the house — and the view never disappoints.",
      image: getFallbackAsset("gallery", 1),
      points: [
        "Private skyline cabana",
        "Sunset-timed tasting menu",
        "Sommelier champagne pairing",
        "City lights as the encore",
      ],
    },
    amenities: {
      eyebrow: "Rooftop Amenities",
      title: "Altitude with everything",
      description:
        "Views, staff and evenings tuned to the skyline.",
      items: [
        { icon: "sun", title: "Sunset dining", description: "Seatings timed to the fall of golden light." },
        { icon: "moon", title: "Sky lounge", description: "Open-air cocktails after dark." },
        { icon: "utensils", title: "Rooftop restaurant", description: "Chef-led menus above the skyline." },
        { icon: "star", title: "City views", description: "Panoramic seats over the glittering city." },
        { icon: "wine", title: "Evening pours", description: "Champagne flights and night cocktails." },
        { icon: "users", title: "Private cabanas", description: "Semi-private pavilions with dedicated servers." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "The city, from above",
      description:
        "Golden-hour tables, sky lounges and skylines that stretch forever.",
      images: galleryImages([1, 0, 2, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your rooftop evening",
      title: "A table above the city",
      description:
        "Reserve the rooftop — our maître d' will hold the best seat for the sunset.",
    },
  },
];

export const getDiningCollection = (id) =>
  DINING_COLLECTIONS.find((item) => item.id === id);

export default DINING_COLLECTIONS;