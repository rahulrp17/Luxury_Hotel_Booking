import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Send,
  X,
  MessageCircle,
  MapPin,
  Star,
  BedDouble,
  Tag,
  Users,
} from "lucide-react";
import { aiService } from "@/services";
import { toErrorMessage } from "@/api";
import { ROUTES, buildPath } from "@/constants/routes";
import { EASE } from "@/theme/animations";

const WELCOME = {
  type: "reply",
  message:
    "Welcome to AureliaStay Concierge. I can find you the perfect luxury stay — try a city, dates, guests or budget.",
  suggestions: ["Luxury hotels in Goa", "Hotels under ₹10,000", "5 star hotels with a pool", "Show me current offers"],
};

const STAR_LABELS = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five" };

const formatINR = (value) => {
  if (value === null || value === undefined) return "";
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

/**
 * Structured result renderers — keep the chat panel compact so results are
 * scannable, with a clear path to the full hotel/room page.
 */
const HotelResult = ({ hotel }) => (
  <Link
    to={buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id })}
    className="group flex items-center gap-3 rounded-xl border border-[#D4AF37]/15 bg-white/[0.03] p-3 transition-colors hover:border-[#D4AF37]/40 hover:bg-white/[0.06]"
  >
    {hotel.image ? (
      <img
        src={hotel.image}
        alt={hotel.name}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
      />
    ) : (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
        <BedDouble size={20} className="text-[#D4AF37]" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-[#F5F1E8]">{hotel.name}</p>
      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#B5B5B5]">
        <MapPin size={11} className="shrink-0" />
        {hotel.city}
        {hotel.starRating ? ` · ${STAR_LABELS[hotel.starRating]} Star` : ""}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#D4AF37]">
        <Star size={11} fill="#D4AF37" />
        {hotel.avgRating?.toFixed(1) || "—"}
        {hotel.priceLabel ? <span className="ml-1 text-[#B5B5B5]">from {hotel.priceLabel}</span> : null}
      </p>
    </div>
  </Link>
);

const RoomResult = ({ room }) => (
  <Link
    to={buildPath(ROUTES.ROOM_DETAIL, { id: room._id })}
    className="group flex items-center gap-3 rounded-xl border border-[#D4AF37]/15 bg-white/[0.03] p-3 transition-colors hover:border-[#D4AF37]/40 hover:bg-white/[0.06]"
  >
    {room.image ? (
      <img
        src={room.image}
        alt={room.name}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
      />
    ) : (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
        <BedDouble size={20} className="text-[#D4AF37]" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-[#F5F1E8]">{room.name}</p>
      <p className="mt-0.5 truncate text-xs text-[#B5B5B5]">{room.hotelName || "AureliaStay"}</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#D4AF37]">
        {room.priceLabel ? <span>{room.priceLabel}/night</span> : null}
        {room.maxGuests ? (
          <span className="flex items-center gap-1 text-[#B5B5B5]">
            <Users size={11} /> up to {room.maxGuests}
          </span>
        ) : null}
      </p>
      {room.estimate && (
        <p className="mt-1 text-[11px] text-[#B5B5B5]">
          {room.estimate.nights}-night est. {formatINR(room.estimate.totalAmount)} incl. tax
        </p>
      )}
    </div>
  </Link>
);

const OfferResult = ({ offer }) => (
  <div className="flex items-start gap-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] p-3">
    <Tag size={16} className="mt-0.5 shrink-0 text-[#D4AF37]" />
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#F5F1E8]">
        {offer.title} <span className="ml-1 rounded bg-[#D4AF37]/15 px-1.5 py-0.5 font-mono text-[10px] text-[#D4AF37]">{offer.code}</span>
      </p>
      {offer.description ? (
        <p className="mt-0.5 text-xs text-[#B5B5B5]">{offer.description}</p>
      ) : null}
      {offer.minBookingAmount ? (
        <p className="mt-0.5 text-[11px] text-[#B5B5B5]">
          Minimum booking {formatINR(offer.minBookingAmount)}
        </p>
      ) : null}
    </div>
  </div>
);

const BulletText = ({ text }) => (
  <p className="whitespace-pre-line text-sm leading-relaxed text-[#E9E4D8]">{text}</p>
);

const Message = ({ msg }) => (
  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
        msg.role === "user"
          ? "rounded-br-md bg-gold-500 text-brand-950"
          : "rounded-bl-md border border-[#D4AF37]/15 bg-white/[0.05]"
      }`}
    >
      {msg.role === "assistant" && msg.text && <BulletText text={msg.text} />}

      {msg.role === "assistant" && msg.suggestions?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {msg.suggestions.map((s) => (
            <span
              key={s}
              className="cursor-pointer rounded-full border border-[#D4AF37]/30 px-3 py-1 text-xs text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/15"
              data-suggestion={s}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {msg.role === "assistant" && msg.hotels?.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {msg.hotels.map((h) => (
            <HotelResult key={h._id} hotel={h} />
          ))}
        </div>
      )}

      {msg.role === "assistant" && msg.rooms?.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {msg.rooms.map((r) => (
            <RoomResult key={r._id} room={r} />
          ))}
        </div>
      )}

      {msg.role === "assistant" && msg.offers?.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {msg.offers.map((o) => (
            <OfferResult key={o._id} offer={o} />
          ))}
        </div>
      )}

      {msg.role === "assistant" && msg.amenities?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {msg.amenities.map((a) => (
            <span key={a} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-[#B5B5B5]">
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", ...WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setLoading(true);

    try {
      const { data } = await aiService.chat(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.message || "",
          suggestions: data.suggestions || undefined,
          hotels: data.hotels || undefined,
          rooms: data.rooms || undefined,
          offers: data.offers || undefined,
          amenities: data.amenities || undefined,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: toErrorMessage(error) || "I'm sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (e) => {
    const suggestion = e.target.closest("[data-suggestion]")?.dataset?.suggestion;
    if (suggestion) send(suggestion);
  };

  return (
    <>
      {/* Floating launch button */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge chat" : "Open AureliaStay concierge chat"}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#A97718] via-[#D4AF37] to-[#F1D67A] text-brand-950 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-gold-300"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {open ? <X size={24} /> : <Sparkles size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="AureliaStay Concierge"
            className="fixed bottom-24 right-6 z-40 flex max-h-[min(70vh,540px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B]/95 text-cream shadow-[0_0_60px_rgba(212,175,55,0.18)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/15 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#A97718] via-[#D4AF37] to-[#F1D67A] text-brand-950">
                <MessageCircle size={18} />
              </div>
              <div className="flex-1">
                <p className="font-serif text-sm font-semibold text-[#F5F1E8]">AureliaStay Concierge</p>
                <p className="text-[11px] text-[#B5B5B5]">Luxury travel assistant · online</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" onClick={handleSuggestion}>
              {messages.map((m, i) => (
                <Message key={i} msg={m} />
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#D4AF37]/15 bg-white/[0.05] px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-[#D4AF37]/15 px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hotels, rooms, offers…"
                aria-label="Message AureliaStay Concierge"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cream placeholder:text-[#8a8a8a] focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-brand-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChat;