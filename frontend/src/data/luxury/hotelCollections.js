/**
 * Hotel collection content for the Aurelia Stay brand pages — the collection
 * and stay-type destinations reachable from the Hotels menu. Each collection
 * has its own dedicated page and genuinely distinct content.
 *
 * Images resolve to local fallback assets via getFallbackAsset; swap any entry
 * for a Cloudinary URL later without touching the pages.
 */
import { getFallbackAsset } from "@/constants/assets";

/** Editorial gallery images (rotating set of real local photos). */
const galleryImages = (indices) =>
  indices.map((i) => ({
    src: getFallbackAsset("gallery", i),
    alt: "Aurelia Stay gallery moment",
  }));

export const HOTEL_COLLECTIONS = [
  {
    id: "beach-resorts",
    seo: {
      title: "Beach Resorts | AureliaStay",
      description:
        "Oceanfront luxury beach resorts by AureliaStay — private beaches, beach villas, sunset residences and ocean dining along the most serene shorelines.",
    },
    hero: {
      eyebrow: "Collections · Beach",
      title: "Where the Sea Meets Serenity",
      description:
        "Step onto warm sand where the horizon blurs into gold. Our beach resorts frame the ocean as a living backdrop — villas that open to the tide, dining beneath the last light of day, and mornings measured in the rhythm of waves.",
      image: getFallbackAsset("hotel", 0),
    },
    intro: {
      eyebrow: "Oceanfront Escapes",
      title: "A shoreline you will never want to leave",
      description:
        "Every beach resort is set on a protected stretch of coast, designed so the water is never far from anywhere you stand. Private beach lounges, tide-timed sundowners and sand between your toes from bedroom to breakfast.",
      image: getFallbackAsset("gallery", 5),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your horizon",
      description:
        "Four ways to wake up to the sea — each with its own rhythm, its own light, its own idea of rest.",
      cols: 4,
      items: [
        {
          title: "Oceanfront Villas",
          meta: "Beach · Villa",
          description:
            "A private villa on the water's edge with a plunge pool, daybed pavilion and steps straight onto the sand.",
          poster: getFallbackAsset("room", 0),
        },
        {
          title: "Private Beach Suites",
          meta: "Suite",
          description:
            "Spacious suites facing an untouched private cove, with outdoor showers and an ocean-view soaking tub.",
          poster: getFallbackAsset("room", 1),
        },
        {
          title: "Sunset Residences",
          meta: "Residence",
          description:
            "West-facing residences designed around the golden hour — panoramic terraces made for long, slow evenings.",
          poster: getFallbackAsset("room", 2),
        },
        {
          title: "Coastal Retreats",
          meta: "Hideaway",
          description:
            "Intimate garden hideaways a short walk from the shore, shaded by palms and cooled by sea breezes.",
          poster: getFallbackAsset("room", 3),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "The Golden Hour Sundowner",
      description:
        "As the sun lowers, our beach butlers prepare a private stretch of sand — lanterns, low chairs and a champagne tasting timed to the tide. The signature ritual of our coastal resorts.",
      image: getFallbackAsset("hotel", 1),
      points: [
        "Private candlelit beach setup",
        "Champagne & canapé service",
        "Live acoustic strings on request",
        "Sunset photograph keepsake",
      ],
    },
    amenities: {
      eyebrow: "Ocean Amenities",
      title: "Everything the sea asks for",
      description:
        "Every comfort is oriented to the water — from salt-washed wellness to dining where the waves set the soundtrack.",
      items: [
        { icon: "waves", title: "Private beaches", description: "Reserved shoreline with daybeds, shade and towel service." },
        { icon: "home", title: "Beach villas", description: "Homes on the sand with private pools and garden showers." },
        { icon: "utensils", title: "Ocean dining", description: "Beachfront tables and tide-side seafood grills." },
        { icon: "sun", title: "Sunset experiences", description: "Daily golden-hour rituals, sailing and catamaran tours." },
        { icon: "umbrella", title: "Beach concierge", description: "Beach butlers, cabana service and waterside amenities." },
        { icon: "compass", title: "Water experiences", description: "Diving, sailing, kayaking and guided reef excursions." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Life at the water's edge",
      description:
        "Moments from our coastal resorts — morning light, quiet coves and long golden evenings.",
      images: galleryImages([0, 1, 2, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your coastal escape",
      title: "Your room by the sea is waiting",
      description:
        "Reserve a beachfront villa or suite — our concierge will arrange transfers, dinner reservations and sunset plans.",
    },
  },
  {
    id: "mountain-resorts",
    seo: {
      title: "Mountain Resorts | AureliaStay",
      description:
        "Alpine luxury mountain resorts by AureliaStay — alpine suites, private chalets, wellness in nature and adventure at altitude.",
    },
    hero: {
      eyebrow: "Collections · Mountain",
      title: "Elevated Escapes",
      description:
        "Above the clouds, the air clears and everything slows. Our mountain resorts nestle into high-altitude valleys — timber, stone and firelight, with trails and snowfields just beyond the terrace.",
      image: getFallbackAsset("hotel", 1),
    },
    intro: {
      eyebrow: "Mountain Retreats",
      title: "Altitude, refined",
      description:
        "Built from local stone and warm timber, each resort is a quiet refuge that frames the peaks. Wake to mist over the valley, spend the day outdoors, and return to fireside lounges and long-table dinners.",
      image: getFallbackAsset("gallery", 4),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Rooms between sky and stone",
      description:
        "Sanctuaries of warmth and wood, each with a view worth waking for.",
      cols: 3,
      items: [
        {
          title: "Alpine Suites",
          meta: "Suite",
          description:
            "Spacious suites with vaulted timber ceilings, fireplaces and floor-to-ceiling windows on the peaks.",
          poster: getFallbackAsset("room", 4),
        },
        {
          title: "Private Chalets",
          meta: "Chalet",
          description:
            "Self-contained chalets with private hot tubs, wood-burning stoves and sweeping valley terraces.",
          poster: getFallbackAsset("room", 5),
        },
        {
          title: "Ridge Rooms",
          meta: "Room",
          description:
            "Cosy rooms set along the ridge line, wrapped in wool, wood and morning light.",
          poster: getFallbackAsset("room", 6),
        },
        {
          title: "Valley Residences",
          meta: "Residence",
          description:
            "Multi-room residences with kitchens and fireplaces, made for long mountain stays.",
          poster: getFallbackAsset("room", 7),
        },
        {
          title: "Summit Suites",
          meta: "Suite",
          description:
            "The highest rooms in the resort, with private balconies built for stargazing.",
          poster: getFallbackAsset("room", 0),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "Wellness at Altitude",
      description:
        "A mountain sanctuary that pairs the crisp air with guided breathwork, mineral pools and forest bathing — led by naturalists and healers who know these valleys.",
      image: getFallbackAsset("amenity", 1),
      points: [
        "Open-air alpine spa pavilions",
        "Guided forest & meadow walks",
        "Mineral soak under the stars",
        "Seasonal mountain cuisine",
      ],
    },
    amenities: {
      eyebrow: "Alpine Amenities",
      title: "Comfort at altitude",
      description:
        "Warmth, wellness and adventure — everything tuned to the rhythm of the mountains.",
      items: [
        { icon: "mountain", title: "Mountain retreats", description: "Resorts cradled in high valleys with panoramic views." },
        { icon: "home", title: "Private chalets", description: "Cosy chalets with hot tubs, stoves and private terraces." },
        { icon: "leaf", title: "Wellness in nature", description: "Spa rituals, mineral pools and guided forest bathing." },
        { icon: "activity", title: "Adventure experiences", description: "Guided treks, ski concierge, climbing and paragliding." },
        { icon: "wind", title: "Crisp alpine air", description: "Unpolluted high-altitude air, filtered and fresh." },
        { icon: "sparkles", title: "Stargazing decks", description: "Rooftop observatories and night-sky lounge terraces." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Above the clouds",
      description:
        "Valleys in morning mist, trails in golden light and the quiet drama of the high country.",
      images: galleryImages([3, 4, 5, 6, 0, 1, 2]),
    },
    cta: {
      eyebrow: "Begin your high escape",
      title: "A room with a view of forever",
      description:
        "Reserve an alpine suite or chalet — our concierge will arrange transfers, trail guides and spa rituals.",
    },
  },
  {
    id: "city-hotels",
    seo: {
      title: "City Hotels | AureliaStay",
      description:
        "Metropolitan luxury city hotels by AureliaStay — executive suites, rooftop dining, business stays and urban experiences in the heart of the city.",
    },
    hero: {
      eyebrow: "Collections · City",
      title: "The City, Refined",
      description:
        "Glittering skylines, quiet elevators and marble floors. Our city hotels sit at the centre of things — steps from galleries, boardrooms and the best tables — while wrapping every stay in calm.",
      image: getFallbackAsset("hotel", 2),
    },
    intro: {
      eyebrow: "Metropolitan Luxury",
      title: "The energy of the city, the calm of a suite",
      description:
        "Between the lobby's polished stone and the bar's amber light, time slows. Daytime is for business and culture; evenings belong to rooftop dinners and skyline views from your bed.",
      image: getFallbackAsset("hotel", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "A base as brilliant as the city",
      description:
        "Refined rooms and suites for work, play and everything in between.",
      cols: 3,
      items: [
        {
          title: "Executive Rooms",
          meta: "Room",
          description:
            "Sleek, light-filled rooms with work desks, lounge seating and skyline views.",
          poster: getFallbackAsset("room", 1),
        },
        {
          title: "Corner Suites",
          meta: "Suite",
          description:
            "Wrap-around corner suites with living rooms and floor-to-ceiling city windows.",
          poster: getFallbackAsset("room", 2),
        },
        {
          title: "Club Floor Rooms",
          meta: "Room",
          description:
            "Access to the private club lounge — breakfast, cocktails and concierge.",
          poster: getFallbackAsset("room", 3),
        },
        {
          title: "Skyline Residences",
          meta: "Residence",
          description:
            "Apartment-style stays with full kitchens, made for longer city sojourns.",
          poster: getFallbackAsset("room", 4),
        },
        {
          title: "Penthouse Suites",
          meta: "Suite",
          description:
            "Private penthouses on the highest floors, with terraces above the city lights.",
          poster: getFallbackAsset("room", 5),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "Rooftop Tables & Skyline Nights",
      description:
        "Dine above the streets at our signature rooftop restaurant, then sink into the sky lounge as the city lights come alive — a metropolitan evening choreographed by our concierge.",
      image: getFallbackAsset("dining", 0),
      points: [
        "Rooftop fine dining & sky lounge",
        "Private boardroom & event spaces",
        "Complimentary chauffeured drop-offs",
        "Same-day pressing & packing",
      ],
    },
    amenities: {
      eyebrow: "City Amenities",
      title: "Everything business needs, everything rest wants",
      description:
        "Seamless arrivals, sharpened service and retreats in the middle of everything.",
      items: [
        { icon: "landmark", title: "Metropolitan luxury", description: "Landmark hotels in the city's finest districts." },
        { icon: "briefcase", title: "Business stays", description: "Boardrooms, workstations and 24-hour business services." },
        { icon: "utensils", title: "Rooftop dining", description: "Signature restaurants and bars above the skyline." },
        { icon: "key", title: "Executive suites", description: "Club-floor access, smart check-in and private lifts." },
        { icon: "clock", title: "Around-the-clock service", description: "24-hour concierge, dining and housekeeping." },
        { icon: "sparkles", title: "Urban experiences", description: "Gallery passes, private tours and event hosting." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Cities, captured",
      description:
        "Skyline dining, marble lobbies and the golden glow of the city at night.",
      images: galleryImages([1, 2, 3, 4, 5, 6, 0]),
    },
    cta: {
      eyebrow: "Begin your city stay",
      title: "The city, from the best address",
      description:
        "Reserve an executive room or penthouse — our concierge will arrange transfers, reservations and itinerary.",
    },
  },
  {
    id: "private-villas",
    seo: {
      title: "Private Villas | AureliaStay",
      description:
        "Exclusive private villas by AureliaStay — personal concierge, private pools, chef and butler service for a world entirely your own.",
    },
    hero: {
      eyebrow: "Collections · Villas",
      title: "Your World, Entirely Private",
      description:
        "Gates close, the world falls away. Our private villas are self-contained estates — pools, gardens, staff and total seclusion — where every detail bends to your day.",
      image: getFallbackAsset("hotel", 4),
    },
    intro: {
      eyebrow: "Private Villas",
      title: "A residence, a staff, a holiday",
      description:
        "Each villa comes with its own team — a butler, a chef, a driver — and its own rhythm. Breakfast when you wake, dinner wherever you wish, and nothing between you and the life you came for.",
      image: getFallbackAsset("hotel", 5),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Estates made for one party of life",
      description:
        "Choose the setting; everything else is already arranged.",
      cols: 4,
      items: [
        {
          title: "Garden Villas",
          meta: "Villa",
          description:
            "Pavilion-style villas set in private gardens with plunge pools and outdoor dining.",
          poster: getFallbackAsset("room", 0),
        },
        {
          title: "Beach Villas",
          meta: "Villa",
          description:
            "Villas on the water with steps to the sand, private pools and ocean-view bedrooms.",
          poster: getFallbackAsset("room", 1),
        },
        {
          title: "Hill Villas",
          meta: "Villa",
          description:
            "Elevated villas with terraced gardens, infinity pools and long horizon views.",
          poster: getFallbackAsset("room", 2),
        },
        {
          title: "The Estate Villa",
          meta: "Signature",
          description:
            "Our grandest residence — multiple pavilions, a full staff and space for the whole family.",
          poster: getFallbackAsset("room", 3),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "A Day Made Entirely Yours",
      description:
        "No itinerary, no schedule. A private chef cooks to your cravings, the butler arranges anything you can imagine, and the villa becomes your world — until you decide otherwise.",
      image: getFallbackAsset("hotel", 6),
      points: [
        "Personal butler & housekeeping",
        "Private chef & in-villa dining",
        "Chauffeured cars & local guides",
        "Spa, yoga and entertainment on call",
      ],
    },
    amenities: {
      eyebrow: "Villa Amenities",
      title: "Everything, without asking",
      description:
        "A private world staffed and styled around you.",
      items: [
        { icon: "home", title: "Private villas", description: "Self-contained estates with gardens and living pavilions." },
        { icon: "shield", title: "Personal concierge", description: "A dedicated concierge who knows your preferences." },
        { icon: "waves", title: "Private pools", description: "Infinity, plunge and family pools — all to yourselves." },
        { icon: "utensils", title: "Chef service", description: "Private chefs cooking bespoke menus in your kitchen." },
        { icon: "bell", title: "Butler service", description: "Unobtrusive butlers on call from dawn to late night." },
        { icon: "sparkles", title: "Exclusive experiences", description: "Boat charters, private safaris and bespoke events." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Secluded worlds",
      description:
        "Private pools, garden dinners and the unhurried luxury of total privacy.",
      images: galleryImages([2, 3, 4, 5, 6, 0, 1]),
    },
    cta: {
      eyebrow: "Begin your private escape",
      title: "The world, entirely yours",
      description:
        "Reserve a private villa — our team will tailor the staff, menus and experiences to your party.",
    },
  },
  {
    id: "rooms",
    seo: {
      title: "Rooms | AureliaStay",
      description:
        "Rooms designed for rest at AureliaStay — Deluxe, Premier, Garden, Ocean and Executive rooms with luxury bedding and considered design.",
    },
    hero: {
      eyebrow: "Stay Types · Rooms",
      title: "Rooms Designed for Rest",
      description:
        "Somewhere between the lobby and your dreams, the room does its quiet work — generous beds, hushed lighting, soft linens and a view that settles you into stillness.",
      image: getFallbackAsset("room", 0),
    },
    intro: {
      eyebrow: "Considered Comfort",
      title: "Every detail, chosen for sleep",
      description:
        "Engineered for a deep night's rest: layered mattresses, pillow menus, blackout that is absolute and air you can set to your liking. The room is not a place to pass through — it is the point.",
      image: getFallbackAsset("room", 1),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Five rooms, one standard of rest",
      description:
        "Each room type shares the same obsessive attention to sleep and service.",
      cols: 3,
      items: [
        {
          title: "Deluxe Rooms",
          meta: "City or Garden",
          description:
            "Warm, understated rooms with king beds, lounge corners and garden or city views.",
          poster: getFallbackAsset("room", 2),
        },
        {
          title: "Premier Rooms",
          meta: "Premium",
          description:
            "Larger rooms on higher floors with upgraded amenities and soaking tubs.",
          poster: getFallbackAsset("room", 3),
        },
        {
          title: "Garden Rooms",
          meta: "Garden View",
          description:
            "Ground-floor rooms opening onto private garden patios and greenery.",
          poster: getFallbackAsset("room", 4),
        },
        {
          title: "Ocean Rooms",
          meta: "Ocean View",
          description:
            "Rooms that wake to the sea, with balconies over the water.",
          poster: getFallbackAsset("room", 5),
        },
        {
          title: "Executive Rooms",
          meta: "Executive",
          description:
            "Work-friendly rooms with desks, espresso corners and club-floor access.",
          poster: getFallbackAsset("room", 6),
        },
      ],
    },
    featured: {
      eyebrow: "The Aurelia Bed",
      title: "Seven layers to silence",
      description:
        "Our signature bed stacks a cooling topper over a hand-tufted core, wrapped in 600-thread Egyptian cotton and finished with a duvet that settles like a cloud. Sleep, perfected.",
      image: getFallbackAsset("room", 7),
      points: [
        "Hand-tufted core & cooling topper",
        "600-thread Egyptian cotton",
        "Pillow & duvet menus",
        "Blackout engineered to 100%",
      ],
    },
    amenities: {
      eyebrow: "Room Amenities",
      title: "The essentials, elevated",
      description:
        "Small touches that make a room feel like a sanctuary.",
      items: [
        { icon: "bed", title: "Signature bedding", description: "Layered beds with pillow and duvet menus." },
        { icon: "eye", title: "Considered views", description: "Garden, city and ocean outlooks from every bed." },
        { icon: "coffee", title: "Espresso corners", description: "In-room coffee, tea and minibar on request." },
        { icon: "key", title: "Digital check-in", description: "Mobile keys and seamless self check-in." },
        { icon: "wind", title: "Personal climate", description: "Individually controlled air and temperature." },
        { icon: "clock", title: "24-hour housekeeping", description: "Turndown, pressing and room service at any hour." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Rooms, in light",
      description:
        "Soft morning light, quiet corners and beds made for long, slow mornings.",
      images: galleryImages([5, 6, 0, 1, 2, 3, 4]),
    },
    cta: {
      eyebrow: "Begin your rest",
      title: "A good night is the whole point",
      description:
        "Reserve a room designed for sleep — choose your view, your pillow and your pace.",
    },
  },
  {
    id: "suites",
    seo: {
      title: "Suites | AureliaStay",
      description:
        "Luxury suites by AureliaStay — Junior, Executive, Signature and Royal Suites with separate living spaces and panoramic views.",
    },
    hero: {
      eyebrow: "Stay Types · Suites",
      title: "Suites Without Compromise",
      description:
        "More than a bigger room — a suite is a small world. A living room to host in, a bedroom to disappear into, a bath made for long soaks and a view that goes on.",
      image: getFallbackAsset("room", 1),
    },
    intro: {
      eyebrow: "Space, Considered",
      title: "A residence for the length of your stay",
      description:
        "Enter through your own foyer. Spread out across separate living and sleeping quarters, dine in, work in comfort and let a dedicated host anticipate the rest.",
      image: getFallbackAsset("room", 2),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Four suites, four ways to spread out",
      description:
        "Each is a private residence with service tailored to you.",
      cols: 4,
      items: [
        {
          title: "Junior Suites",
          meta: "Suite",
          description:
            "A generous bedroom with a separate lounge nook and oversized bath.",
          poster: getFallbackAsset("room", 3),
        },
        {
          title: "Executive Suites",
          meta: "Suite",
          description:
            "Dedicated living and dining rooms with club-floor privileges.",
          poster: getFallbackAsset("room", 4),
        },
        {
          title: "Signature Suites",
          meta: "Signature",
          description:
            "Corner suites with wraparound views, grand bathrooms and butler service.",
          poster: getFallbackAsset("room", 5),
        },
        {
          title: "Royal Suites",
          meta: "Royal",
          description:
            "Our most storied suites — private terraces, libraries and staff on call.",
          poster: getFallbackAsset("room", 6),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "The Suite Host",
      description:
        "Every suite comes with a dedicated host — unpacking, reservations, a surprise or two. Someone who learns your morning tea and has it ready without being asked.",
      image: getFallbackAsset("hotel", 7),
      points: [
        "Dedicated suite host",
        "Complimentary evening canapés",
        "Priority dining reservations",
        "Late checkout, always",
      ],
    },
    amenities: {
      eyebrow: "Suite Amenities",
      title: "A home that anticipates",
      description:
        "The space of an apartment, the service of a great hotel.",
      items: [
        { icon: "bed", title: "Super-king beds", description: "Signature Aurelia bedding in every suite." },
        { icon: "eye", title: "Panoramic views", description: "Floor-to-ceiling windows and private balconies." },
        { icon: "coffee", title: "In-suite dining", description: "Full dining service from our restaurants." },
        { icon: "sparkles", title: "Signature amenities", description: "Bespoke bath rituals and welcome treats." },
        { icon: "key", title: "Priority access", description: "Express check-in and lounge privileges." },
        { icon: "home", title: "Living spaces", description: "Separate living, dining and work rooms." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Suites in light",
      description:
        "Grand baths, private terraces and living rooms built for lingering.",
      images: galleryImages([6, 0, 1, 2, 3, 4, 5]),
    },
    cta: {
      eyebrow: "Begin your suite stay",
      title: "Space, service, serenity",
      description:
        "Reserve a suite — your host will prepare the room, the menus and the details.",
    },
  },
  {
    id: "presidential-suites",
    seo: {
      title: "Presidential Suites | AureliaStay",
      description:
        "The Presidential Collection by AureliaStay — private living rooms, dining rooms, butler service and personal concierge at the peak of luxury.",
    },
    hero: {
      eyebrow: "Stay Types · The Presidential Collection",
      title: "The Presidential Collection",
      description:
        "A floor, not a room. The Presidential Collection occupies entire wings of our finest properties — private entrances, a staff devoted to you, and interiors finished to the last gilded detail.",
      image: getFallbackAsset("room", 2),
    },
    intro: {
      eyebrow: "A Residence of State",
      title: "The peak of the Aurelia Stay standard",
      description:
        "From the moment the private elevator doors open, the world adjusts to you. Enter through your own foyer, gather in a grand salon, dine in a dedicated room and sleep in a suite appointed like a first residence.",
      image: getFallbackAsset("room", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Composed like a palace",
      description:
        "Each Presidential suite is a full residence, not a room.",
      cols: 4,
      items: [
        {
          title: "Presidential Suites",
          meta: "Presidential",
          description:
            "Salons, libraries and master suites finished in marble, silk and gold.",
          poster: getFallbackAsset("room", 4),
        },
        {
          title: "Grand Presidential Suites",
          meta: "Grand",
          description:
            "Expanded residences with private dining rooms and butler pantries.",
          poster: getFallbackAsset("room", 5),
        },
        {
          title: "Royal Presidential Suites",
          meta: "Royal",
          description:
            "Multi-bedroom wings with private terraces and skyline vantage points.",
          poster: getFallbackAsset("room", 6),
        },
        {
          title: "The Chairman's Suite",
          meta: "Signature",
          description:
            "Our most private address — its own entrance, car drop-off and floor.",
          poster: getFallbackAsset("room", 7),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "A Staff of Your Own",
      description:
        "A personal butler, private chef, dedicated concierge and a full household team — all of them yours. Breakfast at whatever hour you wake, dinners composed to your taste, and a floor that is unmistakably yours.",
      image: getFallbackAsset("hotel", 5),
      points: [
        "24-hour butler & household team",
        "Private chef & sommelier",
        "Personal concierge & chauffeur",
        "Private dining & event hosting",
      ],
    },
    amenities: {
      eyebrow: "Presidential Amenities",
      title: "Everything, at the highest level",
      description:
        "A residence of state, with a staff to match.",
      items: [
        { icon: "crown", title: "Presidential suites", description: "Palatial wings at our most exclusive addresses." },
        { icon: "shield", title: "Personal concierge", description: "A dedicated concierge for every request, day or night." },
        { icon: "utensils", title: "Private dining rooms", description: "Dedicated dining rooms with private chef service." },
        { icon: "bell", title: "Butler service", description: "Round-the-clock butlers who anticipate your every need." },
        { icon: "sparkles", title: "Premium amenities", description: "Designer bath products, fine art and bespoke interiors." },
        { icon: "key", title: "Private access", description: "Private lifts, entrances and arrivals just for you." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Residences of state",
      description:
        "Marble salons, gilded details and rooms scaled for entertaining.",
      images: galleryImages([0, 1, 2, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your Presidential stay",
      title: "A floor of the world's finest",
      description:
        "Reserve a Presidential suite — our household team will compose everything around you.",
    },
  },
  {
    id: "family-villas",
    seo: {
      title: "Family Villas | AureliaStay",
      description:
        "Luxury family villas by AureliaStay — multi-bedroom villas, kids experiences, private pools, family dining and connecting rooms.",
    },
    hero: {
      eyebrow: "Stay Types · Family",
      title: "Luxury for Every Generation",
      description:
        "Space for the cousins to race, a kitchen where the family gathers and grown-ups who actually get to relax. Our family villas keep everyone happy — which is the hardest luxury of all.",
      image: getFallbackAsset("room", 3),
    },
    intro: {
      eyebrow: "Family Villas",
      title: "A home away from home, with room for everyone",
      description:
        "Multi-bedroom villas with connecting rooms, private pools and a dedicated family concierge. Kids have their own adventures; adults have their own calm. Everyone meets again at the long dinner table.",
      image: getFallbackAsset("room", 4),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Villas built for togetherness",
      description:
        "Generous layouts that give every generation its own corner.",
      cols: 4,
      items: [
        {
          title: "Family Villas",
          meta: "Villa",
          description:
            "Two and three-bedroom villas with shared living spaces and private pools.",
          poster: getFallbackAsset("room", 5),
        },
        {
          title: "Grand Family Villas",
          meta: "Grand",
          description:
            "Spacious residences for extended families, with staff quarters and kitchens.",
          poster: getFallbackAsset("room", 6),
        },
        {
          title: "Connecting Suites",
          meta: "Suite",
          description:
            "Interconnecting suites for families who want privacy and proximity.",
          poster: getFallbackAsset("room", 7),
        },
        {
          title: "Kids' Pavilions",
          meta: "Kids",
          description:
            "Adjoining rooms styled for children, with games, crafts and their own space.",
          poster: getFallbackAsset("room", 0),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "The Family Concierge",
      description:
        "One person plans it all — kids' clubs, babysitting, family dinners, age-appropriate adventures and a little adult time too. You arrive, and the entire trip is already arranged.",
      image: getFallbackAsset("amenity", 2),
      points: [
        "Dedicated family concierge",
        "Kids' clubs & supervised activities",
        "Babysitting & nanny on request",
        "Family photo sessions & keepsakes",
      ],
    },
    amenities: {
      eyebrow: "Family Amenities",
      title: "Every generation, looked after",
      description:
        "From splash pads to grandparents' reading corners.",
      items: [
        { icon: "users", title: "Multi-bedroom villas", description: "Generous villas with separate rooms for every branch of the family." },
        { icon: "baby", title: "Kids experiences", description: "Clubs, craft rooms, splash zones and teen lounges." },
        { icon: "waves", title: "Private pools", description: "Heated family pools with shallow ends and safety covers." },
        { icon: "utensils", title: "Family dining", description: "Long tables, kids' menus and flexible dining hours." },
        { icon: "home", title: "Connecting rooms", description: "Interconnecting layouts for privacy with proximity." },
        { icon: "heart", title: "Family concierge", description: "A concierge who plans everything, at any age." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Generations, together",
      description:
        "Pools splashed by day, long dinners by night and holidays everyone retells.",
      images: galleryImages([1, 2, 3, 4, 5, 6, 0]),
    },
    cta: {
      eyebrow: "Begin your family escape",
      title: "A holiday everyone remembers",
      description:
        "Reserve a family villa — our family concierge will tailor every day to every age.",
    },
  },
  {
    id: "luxury-resorts",
    seo: {
      title: "Luxury Resorts | AureliaStay",
      description:
        "Signature luxury resorts by AureliaStay — oceanfront palaces, garden retreats, hilltop escapes and lake villas where luxury finds its address.",
    },
    hero: {
      eyebrow: "Collections · Luxury Resorts",
      title: "Where Luxury Finds Its Address",
      description:
        "Aurelia resorts are chosen the way you choose a home — slowly, and for the view. From oceanfront palaces to hilltop hideaways, each one pairs rare settings with the quiet craft of our service.",
      image: getFallbackAsset("hotel", 0),
    },
    intro: {
      eyebrow: "The Resort Standard",
      title: "Grand spaces, gentle service",
      description:
        "Luxury here is not about more — it is about everything being exactly right. Grand pools that meet the horizon, suites that open to the view, dining that follows the sun and a team that anticipates without hovering.",
      image: getFallbackAsset("gallery", 0),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Four ways to arrive",
      description:
        "Each resort is a world of its own, with one shared standard of care.",
      cols: 4,
      items: [
        {
          title: "Oceanfront Palaces",
          meta: "Resort",
          description:
            "Grand pavilions and pools stepped to the water, wrapped in gardens and sea light.",
          poster: getFallbackAsset("room", 1),
        },
        {
          title: "Garden Retreats",
          meta: "Resort",
          description:
            "Lush private estates where courtyards, fountains and frangipani frame every room.",
          poster: getFallbackAsset("room", 2),
        },
        {
          title: "Hilltop Resorts",
          meta: "Resort",
          description:
            "Elevated escapes with infinity pools, valley views and cool high-altitude air.",
          poster: getFallbackAsset("room", 3),
        },
        {
          title: "Lake Villas",
          meta: "Resort",
          description:
            "Heritage villas on still water, with private boat ghats and lakeside dining.",
          poster: getFallbackAsset("room", 4),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Experience",
      title: "The Arrival Ritual",
      description:
        "Arrival at an Aurelia resort is a ceremony of its own — a warm foot ritual, a welcome drink from the estate, a private tour of the grounds and a first glimpse of your suite, prepared long before you landed.",
      image: getFallbackAsset("hotel", 3),
      points: [
        "Private arrival ceremony",
        "Welcome amenity & estate tour",
        "Suite prepared in advance",
        "Dedicated resort host",
      ],
    },
    amenities: {
      eyebrow: "Resort Amenities",
      title: "The luxury of everything, arranged",
      description:
        "Complete resort worlds, orchestrated around a single standard of excellence.",
      items: [
        { icon: "sparkles", title: "Signature suites", description: "Grand suites and villas with rare views." },
        { icon: "waves", title: "Infinity pools", description: "Pools that meet the horizon, heated and tended." },
        { icon: "utensils", title: "Resort dining", description: "Multiple restaurants, from casual to grand." },
        { icon: "leaf", title: "Spa sanctuaries", description: "Full-service spas in garden settings." },
        { icon: "shield", title: "Personal hosts", description: "A host who knows your preferences before you do." },
        { icon: "compass", title: "Curated excursions", description: "Local guides and private experiences on call." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Where luxury lives",
      description:
        "Grand pools, gentle gardens and suites that open to unforgettable views.",
      images: galleryImages([0, 1, 2, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your resort stay",
      title: "Luxury has an address",
      description:
        "Reserve a resort suite — our hosts will prepare the welcome, the dining and the itinerary.",
    },
  },
  {
    id: "signature-collection",
    seo: {
      title: "Signature Collection | AureliaStay",
      description:
        "The AureliaStay Signature Collection — the most considered stays in the portfolio: private residences, rare settings and uncompromising service.",
    },
    hero: {
      eyebrow: "Collections · Signature",
      title: "The Signature Collection",
      description:
        "The Signature Collection is the summit of Aurelia — a hand-picked portfolio of the most considered stays we have ever created. Private, rare and unreservedly personal.",
      image: getFallbackAsset("hotel", 5),
    },
    intro: {
      eyebrow: "An Intimate Portfolio",
      title: "Fewer addresses, higher standards",
      description:
        "Only properties that meet the highest bar earn the Signature name. Each is unique in setting, singular in design and served by a team devoted to a handful of suites rather than a hundred rooms.",
      image: getFallbackAsset("hotel", 6),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Stays that define a standard",
      description:
        "Every Signature stay is a study in considered luxury.",
      cols: 4,
      items: [
        {
          title: "Private Residences",
          meta: "Residence",
          description:
            "Whole-floor residences with private entrances, libraries and staff suites.",
          poster: getFallbackAsset("room", 5),
        },
        {
          title: "Heritage Palaces",
          meta: "Heritage",
          description:
            "Restored palaces where original frescoes meet contemporary comfort.",
          poster: getFallbackAsset("room", 6),
        },
        {
          title: "Secluded Islands",
          meta: "Island",
          description:
            "Island retreats reachable only by boat, with the sea as your garden.",
          poster: getFallbackAsset("room", 7),
        },
        {
          title: "Skyline Penthouses",
          meta: "Penthouse",
          description:
            "Penthouses above the city with terraces, glass walls and skyline bathtubs.",
          poster: getFallbackAsset("room", 0),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Standard",
      title: "The Aurelia Standard",
      description:
        "Every Signature stay is delivered to one uncompromising standard — a personal host, an open kitchen, a car and driver on call, and nothing between you and a perfect day.",
      image: getFallbackAsset("hotel", 7),
      points: [
        "Personal host for your stay",
        "Open kitchen & private chef",
        "Chauffeured car on call",
        "Unlimited arrival flexibility",
      ],
    },
    amenities: {
      eyebrow: "Signature Amenities",
      title: "The summit of the standard",
      description:
        "Rare settings, private teams and the freedom of a home.",
      items: [
        { icon: "crown", title: "Private residences", description: "Whole floors and estates, entirely yours." },
        { icon: "key", title: "Exclusive access", description: "Private entrances, lifts and arrivals." },
        { icon: "utensils", title: "Open kitchens", description: "Chefs who cook to your cravings." },
        { icon: "bell", title: "Dedicated staff", description: "Hosts, butlers and drivers devoted to you." },
        { icon: "sparkles", title: "Bespoke experiences", description: "Anything you can imagine, arranged." },
        { icon: "shield", title: "Total discretion", description: "Privacy held as the highest value." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "The considered few",
      description:
        "Palaces, islands and penthouses — the rare addresses that earn the name.",
      images: galleryImages([5, 6, 0, 1, 2, 3, 4]),
    },
    cta: {
      eyebrow: "Begin your Signature stay",
      title: "The very best we have ever made",
      description:
        "Reserve a Signature residence — our team will compose the stay around you.",
    },
  },
];

export const getHotelCollection = (id) =>
  HOTEL_COLLECTIONS.find((item) => item.id === id);

export default HOTEL_COLLECTIONS;
