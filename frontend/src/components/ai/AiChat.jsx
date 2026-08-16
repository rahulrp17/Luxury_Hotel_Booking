import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Send,
  X,
  MapPin,
  Star,
  BedDouble,
  Tag,
  Users,
  ArrowUpRight,
  Crown,
  Clock3,
} from "lucide-react";
import AS2 from "../../assets/AS2.png";
import { aiService } from "@/services";
import { toErrorMessage } from "@/api";
import { ROUTES, buildPath } from "@/constants/routes";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F1D67A";
const CREAM = "#F5F1E8";

const WELCOME = {
  role: "assistant",
  text: "Welcome to AureliaStay. I’m here to help you discover exceptional hotels, rooms, offers and luxury experiences.",
  suggestions: [
    "Luxury hotels in Mumbai",
    "Hotels under ₹10,000",
    "5 star hotels with a pool",
    "Show me current offers",
  ],
};

const STAR_LABELS = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
};

const formatINR = (value) => {
  if (value === null || value === undefined || value === "") return "";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
};

const formatTime = (date = new Date()) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const getImage = (image) => {
  if (!image || typeof image !== "string") return null;
  return image;
};

/* =========================================================
   Concierge Avatar
========================================================= */

const ConciergeAvatar = ({ small = false }) => (
  <motion.div
    className={`relative flex shrink-0 items-center justify-center rounded-full ${
      small ? "h-9 w-9" : "h-11 w-11"
    }`}
    animate={{
      boxShadow: [
        "0 0 0 rgba(212,175,55,0)",
        "0 0 28px rgba(212,175,55,.32)",
        "0 0 0 rgba(212,175,55,0)",
      ],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8E671A] via-[#D4AF37] to-[#F7E39A]" />

    <div className="absolute inset-[1px] flex items-center justify-center rounded-full bg-[#0B0B0B]">
      <Crown
        size={small ? 15 : 18}
        strokeWidth={1.5}
        className="text-[#D4AF37]"
      />
    </div>
  </motion.div>
);

/* =========================================================
   Hotel Result
========================================================= */

const HotelResult = ({ hotel }) => {
  const image = getImage(hotel.image);

  return (
    <Link
      to={buildPath(ROUTES.HOTEL_DETAIL, {
        id: hotel._id,
      })}
      className="
        group block overflow-hidden rounded-2xl
        border border-white/[0.08]
        bg-white/[0.035]
        transition-all duration-300
        hover:border-[#D4AF37]/40
        hover:bg-white/[0.055]
        hover:shadow-[0_12px_40px_rgba(0,0,0,.35)]
      "
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-[#141414]">
          {image ? (
            <img
              src={image}
              alt={hotel.name || "Luxury hotel"}
              loading="lazy"
              className="
                h-full w-full object-cover
                transition-transform duration-500
                group-hover:scale-110
              "
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BedDouble size={22} className="text-[#D4AF37]/70" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-serif text-[15px] font-medium text-[#F5F1E8]">
              {hotel.name}
            </p>

            <ArrowUpRight
              size={15}
              className="
                shrink-0 text-[#777]
                transition-colors
                group-hover:text-[#D4AF37]
              "
            />
          </div>

          <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#999]">
            <MapPin size={11} />

            {hotel.city || "Luxury destination"}

            {hotel.starRating ? ` · ${STAR_LABELS[hotel.starRating]} Star` : ""}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#D4AF37]">
              <Star size={11} fill={GOLD} />
              {hotel.avgRating?.toFixed?.(1) || "—"}
            </span>

            {hotel.priceLabel && (
              <span className="text-xs text-[#A7A7A7]">
                From {hotel.priceLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

/* =========================================================
   Room Result
========================================================= */

const RoomResult = ({ room }) => {
  const image = getImage(room.image);

  return (
    <Link
      to={buildPath(ROUTES.ROOM_DETAIL, {
        id: room._id,
      })}
      className="
        group block overflow-hidden rounded-2xl
        border border-white/[0.08]
        bg-white/[0.035]
        transition-all duration-300
        hover:border-[#D4AF37]/40
        hover:bg-white/[0.055]
      "
    >
      <div className="flex gap-3 p-3">
        <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-[#141414]">
          {image ? (
            <img
              src={image}
              alt={room.name || "Luxury room"}
              loading="lazy"
              className="
                h-full w-full object-cover
                transition-transform duration-500
                group-hover:scale-110
              "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BedDouble size={22} className="text-[#D4AF37]/70" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-serif text-[15px] text-[#F5F1E8]">
              {room.name}
            </p>

            <ArrowUpRight
              size={15}
              className="shrink-0 text-[#777] group-hover:text-[#D4AF37]"
            />
          </div>

          <p className="mt-1 truncate text-xs text-[#999]">
            {room.hotelName || "AureliaStay"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {room.priceLabel && (
              <span className="text-xs font-medium text-[#D4AF37]">
                {room.priceLabel}/night
              </span>
            )}

            {room.maxGuests && (
              <span className="flex items-center gap-1 text-[11px] text-[#999]">
                <Users size={11} />
                Up to {room.maxGuests}
              </span>
            )}
          </div>

          {room.estimate && (
            <p className="mt-1 text-[10px] text-[#777]">
              {room.estimate.nights}-night estimate ·{" "}
              {formatINR(room.estimate.totalAmount)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

/* =========================================================
   Offer Result
========================================================= */

const OfferResult = ({ offer }) => (
  <Link to="/offers">
    <div
      className="
      rounded-2xl
      border border-[#D4AF37]/20
      bg-gradient-to-br
      from-[#D4AF37]/[0.10]
      to-transparent
      p-4
    "
    >
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10">
          <Tag size={16} className="text-[#D4AF37]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-sm text-[#F5F1E8]">{offer.title}</p>

            {offer.code && (
              <p className="rounded-md border border-[#D4AF37]/20 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-[#D4AF37]">
                <span className="text-amber-300">CODE:</span>
                <span className="text-white">{offer.code}</span>
              </p>
            )}
          </div>

          {offer.description && (
            <p className="mt-1 text-xs leading-relaxed text-[#999]">
              {offer.description}
            </p>
          )}

          {offer.minBookingAmount && (
            <p className="mt-2 text-[10px] text-[#777]">
              Minimum booking: {formatINR(offer.minBookingAmount)}
            </p>
          )}
        </div>
      </div>
    </div>
  </Link>
);

/* =========================================================
   Typing Indicator
========================================================= */

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-end gap-2"
  >
    <ConciergeAvatar small />

    <div className="rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.045] px-4 py-3">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
            animate={{
              opacity: [0.25, 1, 0.25],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: dot * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/* =========================================================
   Message
========================================================= */

const Message = ({ msg, onSuggestion }) => {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mr-2 h-20 w-20 mt-1 ">
          <img src={AS2} className="border border-amber-300 rounded-full" />
        </div>
      )}

      <div className="max-w-[88%]">
        <div
          className={
            isUser
              ? `
                rounded-2xl rounded-br-md
                bg-gradient-to-br
                from-[#D4AF37]
                via-[#E7C75B]
                to-[#F5D979]
                px-4 py-3
                text-[#17130A]
                shadow-[0_8px_30px_rgba(212,175,55,.15)]
              `
              : `
                rounded-2xl rounded-bl-md
                border border-white/[0.08]
                bg-white/[0.045]
                px-4 py-3
                backdrop-blur-xl
              `
          }
        >
          {msg.text && (
            <p
              className={`whitespace-pre-line text-[13px] leading-[1.65] ${
                isUser ? "text-[#17130A]" : "text-[#E7E2D8]"
              }`}
            >
              {msg.text}
            </p>
          )}

          {msg.suggestions?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {msg.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestion(suggestion)}
                  className="
                    rounded-full
                    border border-[#D4AF37]/25
                    bg-black/20
                    px-3 py-1.5
                    text-left text-[11px]
                    text-[#D4AF37]
                    transition-all
                    hover:border-[#D4AF37]/60
                    hover:bg-[#D4AF37]/10
                  "
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {msg.hotels?.length > 0 && (
            <div className="mt-3 space-y-2">
              {msg.hotels.map((hotel) => (
                <HotelResult key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}

          {msg.rooms?.length > 0 && (
            <div className="mt-3 space-y-2">
              {msg.rooms.map((room) => (
                <RoomResult key={room._id} room={room} />
              ))}
            </div>
          )}

          {msg.offers?.length > 0 && (
            <div className="mt-3 space-y-2">
              {msg.offers.map((offer) => (
                <OfferResult key={offer._id} offer={offer} />
              ))}
            </div>
          )}

          {msg.amenities?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {msg.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="
                    rounded-full
                    border border-white/[0.07]
                    bg-white/[0.035]
                    px-2.5 py-1
                    text-[10px]
                    text-[#AAA]
                  "
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className={`mt-1 flex items-center gap-1 text-[9px] text-[#555] ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <Clock3 size={9} />
          {formatTime(msg.createdAt)}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   Main AI Concierge
========================================================= */

const AiChat = () => {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      ...WELCOME,
      createdAt: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  /* Focus input */
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [open]);

  /* Auto scroll */
  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, loading]);

  /* Escape key */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* Send */
  const send = async (text) => {
    const message = (text ?? input).trim();

    if (!message || loading) return;

    const userMessage = {
      role: "user",
      text: message,
      createdAt: new Date(),
    };

    setInput("");
    setMessages((previous) => [...previous, userMessage]);

    setLoading(true);

    try {
      const { data } = await aiService.chat(message);

      const assistantMessage = {
        role: "assistant",
        text:
          data.message ||
          data.reply ||
          "I couldn't find a suitable recommendation right now.",
        suggestions: data.suggestions || undefined,
        hotels: data.hotels || undefined,
        rooms: data.rooms || undefined,
        offers: data.offers || undefined,
        amenities: data.amenities || undefined,
        createdAt: new Date(),
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            toErrorMessage(error) ||
            "I'm sorry, I couldn't connect to the AureliaStay Concierge. Please try again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    send(suggestion);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* =====================================================
          Floating AI / Close Button
      ===================================================== */}

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          open ? "Close AureliaStay Concierge" : "Open AureliaStay Concierge"
        }
        className="
          fixed
          bottom-5 right-5
          z-[100]
          flex h-13 w-13
          items-center justify-center
          rounded-full
          border border-amber-300
          bg-gradient-to-br
          from-[#8E671A]
          via-[#D4AF37]
          to-[#F6DF91]
          text-[#17130A]
          shadow-[0_12px_50px_rgba(212,175,55,.35)]
          outline-none
          transition-all
          hover:scale-105
          focus-visible:ring-2
          focus-visible:ring-[#D4AF37]
          lg:bottom-6 lg:right-5  
          md:bottom-4 md:right-4
        "
        initial={{
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        whileTap={{
          scale: 0.92,
        }}
      >
        <motion.div
          animate={{
            rotate: open ? 90 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          {open ? (
            <X size={25} strokeWidth={1.8} />
          ) : (
            <Sparkles size={25} strokeWidth={1.8} />
          )}
        </motion.div>

        {!open && (
          <motion.span
            className="
              pointer-events-none
              absolute inset-0
              rounded-full
              border border-[#D4AF37]/40
            "
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>

      {/* =====================================================
          AI Concierge Popup
          IMPORTANT: positioned ABOVE the close button
      ===================================================== */}

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="
                fixed inset-0
                z-[80]
                bg-black/60
                backdrop-blur-sm
                md:hidden
              "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="AureliaStay Concierge"
              /*
                IMPORTANT FIX:
                bottom-24 keeps the popup above
                the floating close button.
              */
              className="
                fixed
                bottom-24
                right-4
                z-[90]

                flex
                h-[min(78vh,700px)]
                w-[calc(100vw-2rem)]
                max-w-[430px]
                flex-col
                overflow-hidden

                rounded-[28px]

                border
                border-[#D4AF37]/20

                bg-[#080808]/98

                text-[#F5F1E8]

                shadow-[0_20px_90px_rgba(0,0,0,.75)]

                backdrop-blur-2xl

                sm:bottom-28
                sm:right-7
                sm:h-[min(76vh,700px)]
              "
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 25,
                scale: 0.94,
              }}
              transition={{
                duration: 0.32,
                ease: "easeOut",
              }}
            >
              {/* =================================================
                  Header
              ================================================= */}

              <div className="relative shrink-0 border-b border-white/[0.07]">
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-0
                    h-24
                    w-48
                    -translate-x-1/2
                    rounded-full
                    bg-[#D4AF37]/[0.08]
                    blur-3xl
                  "
                />

                <div className="relative flex items-center gap-3 px-3.5 py-4">
                  <img
                    src={AS2}
                    alt="AureliaStay logo"
                    className="h-10 w-10 border border-amber-300 rounded-full"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-serif text-[16px] font-medium text-[#F5F1E8]">
                        <span>Aurelia</span>{" "}
                        <span className="text-amber-300">Stay</span>
                      </h2>

                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-400
                          shadow-[0_0_8px_rgba(52,211,153,.8)]
                        "
                      />
                    </div>

                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#777]">
                      LUXURY HOTEL BOOKING ASSISTANT
                    </p>
                  </div>

                  {/* Header close */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close concierge"
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/[0.07]
                      text-[#777]
                      transition
                      hover:border-[#D4AF37]/30
                      hover:bg-[#D4AF37]/10
                      hover:text-[#D4AF37]
                    "
                  >
                    <X size={17} />
                  </button>
                </div>

                <motion.div
                  className="
                    h-px
                    origin-center
                    bg-gradient-to-r
                    from-transparent
                    via-[#D4AF37]/50
                    to-transparent
                  "
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              {/* =================================================
                  Messages
              ================================================= */}

              <div
                ref={scrollRef}
                className="
                  min-h-0
                  flex-1
                  space-y-5
                  overflow-y-auto
                  px-4
                  py-5
                  scrollbar-thin
                  scrollbar-track-transparent
                  scrollbar-thumb-[#D4AF37]/20
                  hover:scrollbar-thumb-[#D4AF37]/35
                "
              >
                {messages.map((message, index) => (
                  <Message
                    key={`${message.createdAt?.getTime?.() || index}-${index}`}
                    msg={message}
                    onSuggestion={handleSuggestion}
                  />
                ))}

                {loading && <TypingIndicator />}
              </div>

              {/* =================================================
                  Input
              ================================================= */}

              <div
                className="
                  shrink-0
                  border-t
                  border-white/[0.07]
                  bg-[#080808]/95
                  p-3
                "
              >
                <form onSubmit={handleSubmit}>
                  <div
                    className="
                      flex
                      items-end
                      gap-2
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-white/[0.035]
                      p-2
                      transition
                      focus-within:border-[#D4AF37]/35
                      focus-within:shadow-[0_0_30px_rgba(212,175,55,.06)]
                    "
                  >
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about your perfect stay..."
                      aria-label="Message AureliaStay Concierge"
                      className="
                        max-h-28
                        min-h-[42px]
                        min-w-0
                        flex-1
                        resize-none
                        bg-transparent
                        px-3
                        py-2.5
                        text-sm
                        text-[#F5F1E8]
                        outline-none
                        placeholder:text-[#666]
                      "
                    />

                    <motion.button
                      type="submit"
                      disabled={loading || !input.trim()}
                      aria-label="Send message"
                      whileTap={{ scale: 0.9 }}
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-[#C69A2B]
                        via-[#D4AF37]
                        to-[#F1D67A]
                        text-[#17130A]
                        shadow-[0_5px_20px_rgba(212,175,55,.20)]
                        transition
                        hover:shadow-[0_8px_30px_rgba(212,175,55,.35)]
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      {loading ? (
                        <motion.span
                          className="
                            h-4
                            w-4
                            rounded-full
                            border-2
                            border-[#17130A]/30
                            border-t-[#17130A]
                          "
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <Send size={17} />
                      )}
                    </motion.button>
                  </div>

                  <div className="mt-2 flex items-center justify-between px-1">
                    <p className="text-[9px] text-[#555]">
                      AureliaStay AI Concierge
                    </p>

                    <p className="text-[9px] text-[#555]">
                      Enter to send · Shift + Enter for new line
                    </p>
                  </div>
                </form>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChat;
