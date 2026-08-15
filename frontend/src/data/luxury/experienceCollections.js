/**
 * Experience collection content for the Aurelia Stay brand pages. Each item is
 * a dedicated page with genuinely distinct content — one destination per menu
 * item, never shared duplicates.
 */
import { getFallbackAsset } from "@/constants/assets";

const galleryImages = (indices) =>
  indices.map((i) => ({
    src: getFallbackAsset("gallery", i),
    alt: "Aurelia Stay experience moment",
  }));

export const EXPERIENCE_COLLECTIONS = [
  {
    id: "spa",
    seo: {
      title: "Spa | AureliaStay",
      description:
        "Luxury spa rituals at AureliaStay — signature massage rituals, hot-stone ceremonies, aromatherapy journeys, facial therapies, hydrothermal circuits and couples' suites.",
    },
    hero: {
      eyebrow: "Experiences · Spa",
      title: "Rituals of Renewal",
      description:
        "Enter a world of candlelight, warm stone and practiced hands. Our spa rituals are ceremonies of renewal — each treatment a sequence designed to release, restore and leave you weightless.",
      image: getFallbackAsset("amenity", 1),
    },
    intro: {
      eyebrow: "The Spa",
      title: "Treatments composed like ceremonies",
      description:
        "From the foot ritual that begins every visit to the herbal tea that closes it, each treatment is a quiet performance — warm hands, slow movements and oils chosen for the season and your body.",
      image: getFallbackAsset("amenity", 0),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your ritual",
      description:
        "Seven signatures, each with its own rhythm and result.",
      cols: 3,
      items: [
        {
          title: "Signature Massage Rituals",
          meta: "Massage",
          description:
            "Full-body sequences blending deep tissue, aromatherapy and gentle stretching.",
          poster: getFallbackAsset("amenity", 1),
        },
        {
          title: "Hot-Stone Ceremonies",
          meta: "Signature",
          description:
            "Warm basalt stones melt tension along the spine, set to guided breathing.",
          poster: getFallbackAsset("amenity", 0),
        },
        {
          title: "Aromatherapy Journeys",
          meta: "Aromatherapy",
          description:
            "Oils blended to your mood, diffused through a slow full-body massage.",
          poster: getFallbackAsset("gallery", 5),
        },
        {
          title: "Facial Therapies",
          meta: "Facial",
          description:
            "Skin rituals using botanical actives, lymphatic tools and candlelit calm.",
          poster: getFallbackAsset("gallery", 6),
        },
        {
          title: "Hydrothermal Circuits",
          meta: "Water",
          description:
            "A journey through sauna, steam, plunge pools and warm-stone loungers.",
          poster: getFallbackAsset("gallery", 0),
        },
        {
          title: "Couples' Suites",
          meta: "For Two",
          description:
            "Private suites for side-by-side treatments, set to a shared soundtrack.",
          poster: getFallbackAsset("gallery", 4),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Ritual",
      title: "The Midnight Spa Ritual",
      description:
        "Our most requested ceremony: a 90-minute sequence of hot-stone therapy, aromatic oil and guided breath set to candlelight, ending in restorative herbal tea and silence.",
      image: getFallbackAsset("amenity", 1),
      points: [
        "Private candlelit suite",
        "Hot-stone & aromatherapy",
        "Guided breath sequence",
        "Post-treatment herbal tea",
      ],
    },
    amenities: {
      eyebrow: "Spa Amenities",
      title: "A sanctuary in full",
      description:
        "Everything a ritual needs, from robes to rainfall showers.",
      items: [
        { icon: "leaf", title: "Private suites", description: "Candlelit treatment rooms, your own." },
        { icon: "sun", title: "Heated loungers", description: "Warm-stone loungers between treatments." },
        { icon: "waves", title: "Hydro circuit", description: "Sauna, steam and plunge pools." },
        { icon: "sparkles", title: "Bespoke blends", description: "Oils composed for you alone." },
        { icon: "wind", title: "Quiet zones", description: "Silent gardens and restful corners." },
        { icon: "clock", title: "Flexible hours", description: "Morning-to-midnight appointment times." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Rituals, in light",
      description:
        "Candlelit suites, warm stone and the quiet luxury of being cared for.",
      images: galleryImages([4, 5, 6, 0, 1, 2, 3]),
    },
    cta: {
      eyebrow: "Begin your ritual",
      title: "An hour of stillness, composed",
      description:
        "Book a spa ritual — our therapists will match the treatment to your body and mood.",
    },
  },
  {
    id: "wellness",
    seo: {
      title: "Wellness | AureliaStay",
      description:
        "Wellness, reimagined at AureliaStay — holistic retreats, fitness and movement, nutrition, thermal circuits, mental wellbeing and personal coaching.",
    },
    hero: {
      eyebrow: "Experiences · Wellness",
      title: "Wellness, Reimagined",
      description:
        "Wellness is not a treatment but a way of being. Our programs weave movement, nutrition, rest and mindfulness into a single considered journey — for a day, a week or a life.",
      image: getFallbackAsset("gallery", 6),
    },
    intro: {
      eyebrow: "The Wellness Way",
      title: "A complete journey, not a checklist",
      description:
        "Begin with a wellness consultation, then let our practitioners shape your days — morning movement, mindful cuisine, restorative afternoons and evenings that know when to end.",
      image: getFallbackAsset("amenity", 0),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Four paths into wellness",
      description:
        "Programs designed by practitioners who care about results.",
      cols: 3,
      items: [
        {
          title: "Wellness Retreats",
          meta: "Retreat",
          description:
            "Multi-day immersions combining movement, nutrition, rest and coaching.",
          poster: getFallbackAsset("amenity", 1),
        },
        {
          title: "Fitness & Movement",
          meta: "Movement",
          description:
            "Private training, Pilates, aqua workouts and sunrise sessions.",
          poster: getFallbackAsset("amenity", 2),
        },
        {
          title: "Nutrition & Cuisine",
          meta: "Nutrition",
          description:
            "Chef-led mindful menus, consultations and cooking sessions.",
          poster: getFallbackAsset("gallery", 5),
        },
        {
          title: "Thermal Circuits",
          meta: "Restore",
          description:
            "Sauna, steam and contrast pools to reset the nervous system.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Mental Wellbeing",
          meta: "Mind",
          description:
            "Mindfulness, journaling and guided practices for the mind.",
          poster: getFallbackAsset("gallery", 0),
        },
        {
          title: "Personal Coaching",
          meta: "Private",
          description:
            "One-to-one sessions with wellness practitioners and trainers.",
          poster: getFallbackAsset("gallery", 1),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Program",
      title: "The Seven-Day Reset",
      description:
        "A week that recalibrates — daily movement at dawn, mindful cuisine, thermal recovery, restorative sleep and a closing consultation that gives you the tools to continue at home.",
      image: getFallbackAsset("amenity", 0),
      points: [
        "Wellness consultation first",
        "Daily movement & recovery",
        "Mindful cuisine throughout",
        "Take-home wellness plan",
      ],
    },
    amenities: {
      eyebrow: "Wellness Amenities",
      title: "A campus for better being",
      description:
        "Studios, thermal pools and calm corners for every part of you.",
      items: [
        { icon: "activity", title: "Fitness studios", description: "Modern studios with trainers on call." },
        { icon: "leaf", title: "Holistic programs", description: "Body, mind and nourishment together." },
        { icon: "sun", title: "Thermal circuits", description: "Sauna, steam and contrast pools." },
        { icon: "sparkles", title: "Mindful cuisine", description: "Seasonal menus built for energy." },
        { icon: "moon", title: "Sleep clinics", description: "Protocols for deeper, longer rest." },
        { icon: "shield", title: "Health partners", description: "Practitioners, physios and trainers." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Better, by design",
      description:
        "Studios at sunrise, mindful plates and the calm of a considered week.",
      images: galleryImages([6, 5, 4, 3, 2, 1, 0]),
    },
    cta: {
      eyebrow: "Begin your wellness journey",
      title: "A week that changes the way you feel",
      description:
        "Book a wellness program — our practitioners will design the journey around you.",
    },
  },
  {
    id: "yoga-meditation",
    seo: {
      title: "Yoga & Meditation | AureliaStay",
      description:
        "Yoga and meditation experiences at AureliaStay — yoga at dawn, vinyasa classes, guided meditation, breathwork, sound baths and private practice.",
    },
    hero: {
      eyebrow: "Experiences · Yoga",
      title: "Stillness Within",
      description:
        "Before the world wakes, the mat is waiting. Our yoga and meditation practices find stillness at sunrise, in garden groves and candlelit rooms — guided by teachers who make silence feel spacious.",
      image: getFallbackAsset("amenity", 0),
    },
    intro: {
      eyebrow: "The Practice",
      title: "Move, breathe, arrive",
      description:
        "From a first downward dog to a silent retreat, every practice is graded to you. Sequence by sequence, you find what yoga was always for — a settled mind and a body that feels at home.",
      image: getFallbackAsset("gallery", 5),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your practice",
      description:
        "Six ways to step onto the mat.",
      cols: 3,
      items: [
        {
          title: "Yoga at Dawn",
          meta: "Sunrise",
          description:
            "Sunrise asana on a sea-facing deck, guided for every level.",
          poster: getFallbackAsset("amenity", 0),
        },
        {
          title: "Vinyasa Classes",
          meta: "Flow",
          description:
            "Breath-led flows that build heat and then settle into stillness.",
          poster: getFallbackAsset("gallery", 5),
        },
        {
          title: "Guided Meditation",
          meta: "Mind",
          description:
            "Sit-guided meditations in garden groves and candlelit rooms.",
          poster: getFallbackAsset("gallery", 6),
        },
        {
          title: "Breathwork Sessions",
          meta: "Breath",
          description:
            "Pranayama and breath practices to calm and re-energise.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Sound Baths",
          meta: "Sound",
          description:
            "Immersive sound journeys of gongs and singing bowls.",
          poster: getFallbackAsset("gallery", 0),
        },
        {
          title: "Private Practice",
          meta: "Private",
          description:
            "One-to-one classes tailored to your body, goals and pace.",
          poster: getFallbackAsset("gallery", 1),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Practice",
      title: "Sunrise on the Sea Deck",
      description:
        "The signature beginning: asana meeting the first light over the water, a guided breath sequence, and savasana to the sound of the tide — followed by herbal tea and silence.",
      image: getFallbackAsset("amenity", 0),
      points: [
        "Open sea-facing deck",
        "All levels welcome",
        "Sunrise meditation",
        "Herbal tea to close",
      ],
    },
    amenities: {
      eyebrow: "Practice Amenities",
      title: "Rooms for the inner life",
      description:
        "Studios, decks and gardens made for practice.",
      items: [
        { icon: "sun", title: "Open-air decks", description: "Practice with the sky overhead." },
        { icon: "leaf", title: "Garden groves", description: "Shaded outdoor meditation spots." },
        { icon: "moon", title: "Candlelit rooms", description: "Quiet indoor studios after dark." },
        { icon: "sparkles", title: "Ritual props", description: "Mats, bolsters and blankets, kept." },
        { icon: "wind", title: "Breath-led flow", description: "Pranayama woven into classes." },
        { icon: "shield", title: "Qualified guides", description: "Certified teachers and meditation guides." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Stillness, seen",
      description:
        "Decks at dawn, groves in morning mist and the quiet of a practiced mind.",
      images: galleryImages([1, 2, 3, 4, 5, 6, 0]),
    },
    cta: {
      eyebrow: "Begin your practice",
      title: "Come to the mat",
      description:
        "Book a class or a private session — our teachers will meet you wherever you are.",
    },
  },
  {
    id: "adventure",
    seo: {
      title: "Adventure Experiences | AureliaStay",
      description:
        "Adventure experiences at AureliaStay — mountain trekking, diving, water adventures, climbing, private excursions and guided expeditions.",
    },
    hero: {
      eyebrow: "Experiences · Adventure",
      title: "Beyond the Ordinary",
      description:
        "Ridges, reefs and rivers — our adventure collection pairs the wild with the comfortable. Expert guides, full gear and a warm welcome waiting at the end of every trail.",
      image: getFallbackAsset("hotel", 2),
    },
    intro: {
      eyebrow: "The Adventurous Way",
      title: "Wild days, comforted evenings",
      description:
        "Take on the mountain by day and return to warm towels, a soak and a dinner already arranged. Every adventure is guided, equipped and unhurried.",
      image: getFallbackAsset("gallery", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your expedition",
      description:
        "Adventures graded for every ambition.",
      cols: 3,
      items: [
        {
          title: "Mountain Trekking",
          meta: "Treks",
          description:
            "Guided trails through valleys and ridges, graded for every fitness.",
          poster: getFallbackAsset("hotel", 1),
        },
        {
          title: "Diving & Reefs",
          meta: "Water",
          description:
            "Private dive masters, pristine reefs and certifications at every level.",
          poster: getFallbackAsset("gallery", 0),
        },
        {
          title: "Water Adventures",
          meta: "Water",
          description:
            "Canyoning, kayaking, jet boats and sails — wet, fast, unforgettable.",
          poster: getFallbackAsset("gallery", 1),
        },
        {
          title: "Alpine Climbing",
          meta: "Climb",
          description:
            "Guided climbs and via ferrata for first-timers and ascensionists.",
          poster: getFallbackAsset("gallery", 2),
        },
        {
          title: "Private Excursions",
          meta: "Private",
          description:
            "A guide, a vehicle and a route built around exactly what you want to see.",
          poster: getFallbackAsset("gallery", 3),
        },
        {
          title: "Guided Expeditions",
          meta: "Expedition",
          description:
            "Multi-day journeys with naturalists, camps and full service.",
          poster: getFallbackAsset("gallery", 4),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Expedition",
      title: "The Ridge Line",
      description:
        "A dawn start, a ridge trail above the tree line and a summit breakfast as the valley wakes below. Led by local guides, timed to the light, and finished with a well-earned soak.",
      image: getFallbackAsset("hotel", 3),
      points: [
        "Local expert guides",
        "Summit breakfast included",
        "Gear & safety briefed",
        "Recovery soak on return",
      ],
    },
    amenities: {
      eyebrow: "Adventure Amenities",
      title: "Comfort meets the wild",
      description:
        "Gear, guides and good spirits for every horizon.",
      items: [
        { icon: "compass", title: "Guided expeditions", description: "Expert-led journeys into the wild." },
        { icon: "mountain", title: "Trekking", description: "Trails across ridges, valleys and passes." },
        { icon: "waves", title: "Diving & water", description: "Reefs, rivers and coasts, guided and equipped." },
        { icon: "activity", title: "Alpine climbing", description: "Guided ascents for every level." },
        { icon: "flame", title: "Summit breakfasts", description: "Meals at the top, always." },
        { icon: "sun", title: "Sunrise departures", description: "Start early, finish golden." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "The wild, witnessed",
      description:
        "Ridge lines at golden hour, rivers in spate and trails that test you well.",
      images: galleryImages([2, 3, 4, 5, 6, 0, 1]),
    },
    cta: {
      eyebrow: "Begin your expedition",
      title: "The extraordinary, arranged",
      description:
        "Reserve an adventure — our expedition team will plan routes, gear and guides around you.",
    },
  },
  {
    id: "private-dining",
    seo: {
      title: "Private Dining Experiences | AureliaStay",
      description:
        "Private dining experiences at AureliaStay — beach dining, villa dining, chef's table, candlelight dinners, destination dining and a personal chef.",
    },
    hero: {
      eyebrow: "Experiences · Private Dining",
      title: "An Evening Made Entirely Yours",
      description:
        "Dinner where there is no dining room — a table on the sand, a chef in your villa, a long candlelit evening composed entirely for you.",
      image: getFallbackAsset("dining", 0),
    },
    intro: {
      eyebrow: "The Private Table",
      title: "A seat that is entirely yours",
      description:
        "Tell us the setting and the craving — our chefs and sommeliers will do the rest. A picnic on a hidden beach, a tasting menu at the kitchen's edge, a dinner in the middle of nowhere that somehow has everything.",
      image: getFallbackAsset("dining", 1),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your evening",
      description:
        "Six ways to sit at your own table.",
      cols: 3,
      items: [
        {
          title: "Beach Dining",
          meta: "Upon the Sand",
          description:
            "A table set at the water's edge, lit by lanterns and timed to the tide.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "Private Villa Dining",
          meta: "In Residence",
          description:
            "Your own chef, your own kitchen, dinner exactly as you want it.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "The Chef's Table",
          meta: "In the Kitchen",
          description:
            "Eight courses composed table-side, narrated as they're plated.",
          poster: getFallbackAsset("dining", 0),
        },
        {
          title: "Candlelight Dinners",
          meta: "Romance",
          description:
            "Quiet rooms and candlelit tables, set for two and no one else.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Destination Dining",
          meta: "Unforgettable",
          description:
            "Dinner where you least expect it — a hilltop, a shore, a garden.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Personal Chef Stays",
          meta: "In Villa",
          description:
            "A chef at your side for the weekend, tasting every meal before you do.",
          poster: getFallbackAsset("gallery", 5),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Evening",
      title: "The Beach for Two",
      description:
        "Lanterns, low chairs and a table set where the waves will reach the scent of the candles. A seasonal tasting menu, a sommelier's pairing and a sky that does the rest.",
      image: getFallbackAsset("dining", 2),
      points: [
        "Private beach setup",
        "Seasonal tasting menu",
        "Sommelier wine pairing",
        "Photograph keepsake",
      ],
    },
    amenities: {
      eyebrow: "Dining Amenities",
      title: "Everything a great dinner needs",
      description:
        "Chefs, cellars and settings — all at your command.",
      items: [
        { icon: "utensils", title: "Personal chef", description: "A chef who cooks only for you." },
        { icon: "sparkles", title: "Destination dining", description: "Dinners staged in unforgettable settings." },
        { icon: "flame", title: "Chef's table", description: "Tasting menus composed before you." },
        { icon: "star", title: "Candlelight dinners", description: "Set for two, lit only by candlelight." },
        { icon: "wine", title: "Cellar pairings", description: "Sommelier-led pairings for every course." },
        { icon: "moon", title: "Evening settings", description: "Dusk, dark and starlight as the backdrop." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Tables worth remembering",
      description:
        "Lantern-lit beaches, kitchen edges and dinners composed around you.",
      images: galleryImages([0, 1, 2, 3, 4, 5, 6]),
    },
    cta: {
      eyebrow: "Begin your private dinner",
      title: "An evening, composed for two",
      description:
        "Reserve a private dining experience — our culinary concierge will build the menu and the setting.",
    },
  },
  {
    id: "safari",
    seo: {
      title: "Safari Experiences | AureliaStay",
      description:
        "Luxury safari experiences at AureliaStay — dawn safari expeditions, private game drives, bush breakfasts, walking safaris, photographic safaris and night safaris.",
    },
    hero: {
      eyebrow: "Experiences · Safari",
      title: "Into the Wild",
      description:
        "The wild at its most honest hour. Our safaris are led by naturalists who read the land — dawn drives, bush breakfasts and nights that belong to the animals.",
      image: getFallbackAsset("hotel", 2),
    },
    intro: {
      eyebrow: "The Reserve",
      title: "The bush, at your pace",
      description:
        "Whether you want a single dawn drive or a week of tracking, our naturalists shape the safari to you — and our camp team has a hot shower and a cold drink waiting at the end of every game drive.",
      image: getFallbackAsset("hotel", 3),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your safari",
      description:
        "Wildlife mornings and nights, guided by people who love the bush.",
      cols: 3,
      items: [
        {
          title: "Dawn Safari Expedition",
          meta: "Wildlife",
          description:
            "Leave by starlight, watch the reserve wake, breakfast at a private hide.",
          poster: getFallbackAsset("hotel", 2),
        },
        {
          title: "Private Game Drives",
          meta: "Game Drive",
          description:
            "Open-topped 4×4s and a tracker who knows where the animals are.",
          poster: getFallbackAsset("hotel", 3),
        },
        {
          title: "Bush Breakfasts",
          meta: "Breakfast",
          description:
            "A table set in the wild — coffee, eggs and the morning chorus.",
          poster: getFallbackAsset("gallery", 4),
        },
        {
          title: "Walking Safaris",
          meta: "On Foot",
          description:
            "Track prints, read spoor and walk the reserve with armed naturalists.",
          poster: getFallbackAsset("gallery", 5),
        },
        {
          title: "Photographic Safaris",
          meta: "Photography",
          description:
            "Golden-hour light, hides and a pro photographer as your guide.",
          poster: getFallbackAsset("gallery", 0),
        },
        {
          title: "Night Safaris",
          meta: "Night",
          description:
            "Spotlights and silence — meet the creatures that own the dark.",
          poster: getFallbackAsset("gallery", 1),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Safari",
      title: "The Wild Morning",
      description:
        "Leave by starlight in an open-topped vehicle, watch the mist roll off the river and herds move to water — then toast the sunrise with coffee at a private hide.",
      image: getFallbackAsset("hotel", 3),
      points: [
        "Naturalist-led 4×4",
        "Private bush breakfast",
        "River game hides",
        "Field guides & binoculars",
      ],
    },
    amenities: {
      eyebrow: "Safari Amenities",
      title: "The wild, comforted",
      description:
        "Guides, gear and warm welcomes in the bush.",
      items: [
        { icon: "compass", title: "Naturalist guides", description: "Guides who read tracks and behaviour." },
        { icon: "activity", title: "Game tracking", description: "Pods, prides and migrations, professionally read." },
        { icon: "flame", title: "Bush breakfasts", description: "Meals set in the heart of the reserve." },
        { icon: "sun", title: "Dawn departures", description: "Leaves timed to the animals." },
        { icon: "camera", title: "Photographic hides", description: "Purpose-built hides for close frames." },
        { icon: "moon", title: "Night safaris", description: "Spotlit evenings in the wild." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "The reserve, revealed",
      description:
        "Mist on the river, herds at golden hour and the quiet thrill of the wild.",
      images: galleryImages([3, 2, 1, 0, 6, 5, 4]),
    },
    cta: {
      eyebrow: "Begin your safari",
      title: "Answer the call of the wild",
      description:
        "Reserve a safari — our naturalists will plan the drives, hides and camps around you.",
    },
  },
  {
    id: "wine",
    seo: {
      title: "Wine Experiences | AureliaStay",
      description:
        "Luxury wine experiences at AureliaStay — private wine tasting, sommelier experiences, cellar tours, wine pairing, vineyard journeys and signature collections.",
    },
    hero: {
      eyebrow: "Experiences · Wine",
      title: "The Art of Wine",
      description:
        "Below the resort, in a cellar that holds four thousand bottles, time is measured in vintages. Our wine experiences open rare labels, hidden cellars and quiet afternoons of perfect pairing.",
      image: getFallbackAsset("dining", 3),
    },
    intro: {
      eyebrow: "The Wine Way",
      title: "Taste the story in every bottle",
      description:
        "From vertical tastings of a single vineyard to journeys through the region's estates, our sommeliers turn an afternoon into a masterclass — generous, personal and never precious.",
      image: getFallbackAsset("dining", 0),
    },
    cards: {
      eyebrow: "The Collection",
      title: "Choose your tasting",
      description:
        "Six pours into the art of wine.",
      cols: 3,
      items: [
        {
          title: "Private Wine Tasting",
          meta: "Tasting",
          description:
            "A cellar-side tasting guided by our head sommelier, drawn from hidden allocations.",
          poster: getFallbackAsset("dining", 3),
        },
        {
          title: "Sommelier Experiences",
          meta: "Sommelier",
          description:
            "One-to-one hours with our sommeliers — theory, taste and favourites.",
          poster: getFallbackAsset("dining", 0),
        },
        {
          title: "Cellar Tours",
          meta: "Tour",
          description:
            "Descend into the underground cellar — 4,000 bottles, many one-of-a-kind.",
          poster: getFallbackAsset("dining", 1),
        },
        {
          title: "Wine Pairing Dinners",
          meta: "Dinner",
          description:
            "Seasonal menus built course by course around rare pairings.",
          poster: getFallbackAsset("dining", 2),
        },
        {
          title: "Vineyard Journeys",
          meta: "Journey",
          description:
            "Private visits to neighbouring estates, tastings at the source.",
          poster: getFallbackAsset("gallery", 6),
        },
        {
          title: "Signature Collections",
          meta: "Collector",
          description:
            "Vertical flights and vintage comparisons for the true collector.",
          poster: getFallbackAsset("gallery", 5),
        },
      ],
    },
    featured: {
      eyebrow: "Signature Tasting",
      title: "The Vertical, Underground",
      description:
        "A single vineyard, four vintages, one candlelit cellar. Our sommelier walks you through each glass as cheese and charcuterie arrive from the kitchen.",
      image: getFallbackAsset("dining", 1),
      points: [
        "Private cellar setting",
        "Vertical vineyard flight",
        "Artisan cheese & charcuterie",
        "Personalised cellar notes",
      ],
    },
    amenities: {
      eyebrow: "Wine Amenities",
      title: "A cellar that tells stories",
      description:
        "Rare bottles, expert hands and poured gold.",
      items: [
        { icon: "wine", title: "Cellar tours", description: "Guided walks through 4,000-bottle cellars." },
        { icon: "sparkles", title: "Private tastings", description: "Cellar-side tastings from hidden allocations." },
        { icon: "star", title: "Sommelier experiences", description: "Head sommelier hours, one-to-one." },
        { icon: "clock", title: "Vintage maturities", description: "Vertical flights and aged reserves." },
        { icon: "utensils", title: "Wine pairing", description: "Menus composed around perfect pairings." },
        { icon: "heart", title: "Signature collections", description: "For the collector who has tasted everything." },
      ],
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Cellars & glasses",
      description:
        "Candlelit cellars, amber pours and afternoons that taste like gold.",
      images: galleryImages([3, 2, 1, 0, 5, 4, 6]),
    },
    cta: {
      eyebrow: "Begin your wine journey",
      title: "An art you can taste",
      description:
        "Reserve a tasting or a cellar tour — our sommeliers will tailor the pours to your palate.",
    },
  },
];

export const getExperienceCollection = (id) =>
  EXPERIENCE_COLLECTIONS.find((item) => item.id === id);

export default EXPERIENCE_COLLECTIONS;