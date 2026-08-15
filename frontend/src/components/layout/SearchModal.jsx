import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  SlidersHorizontal,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  Star,
  RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { HOTEL_CATEGORIES } from "@/constants/enums";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setFilters, selectSearch } from "@/store/slices/searchSlice";
import { hotelService } from "@/services";
import { toErrorMessage } from "@/api";
import { EASE, fadeInUp, staggerContainer } from "@/theme/animations";

const SUGGESTIONS_KEY = ["hotels", "search-suggestions"];
const SUGGESTIONS_LIMIT = 50;
const SUGGESTIONS_STALE_TIME = 5 * 60 * 1000;

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const STAR_OPTIONS = [1, 2, 3, 4, 5];

const toDate = (date) => date.toISOString().split("T")[0];
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDate(d);
};

const inputCls =
  "w-full rounded-2xl border border-[#D4AF37]/20 bg-white/[0.04] px-4 py-3 text-sm text-cream placeholder-cream/35 backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37]/40 focus:border-[#D4AF37]/70 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25 [color-scheme:dark]";

const selectCls =
  "w-full cursor-pointer appearance-none rounded-2xl border border-[#D4AF37]/20 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-cream backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37]/40 focus:border-[#D4AF37]/70 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25 [color-scheme:dark]";

const chipCls = (active = false) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-all duration-200 ${
    active
      ? "border-[#D4AF37] bg-[#D4AF37] text-[#0b0b0b] shadow-[0_8px_24px_rgba(212,175,55,0.35)]"
      : "border-[#D4AF37]/20 bg-white/[0.03] text-cream/65 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#e7c977]"
  }`;

const Label = ({ icon, children }) => (
  <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d7ad43]">
    {icon}
    {children}
  </label>
);

const FieldError = ({ children }) => (
  <p role="alert" className="mt-1.5 text-xs font-medium text-[#ff6b6b]">
    {children}
  </p>
);

/**
 * Luxury search modal — fully wired to the hotel backend.
 *
 * Collects destination, dates, guests and the same filters exposed on the
 * hotels listing (property type, star rating, price, sort), validates them,
 * persists them into the global search slice and routes to the hotels page,
 * which reads the slice and fetches live results. Popular destinations are
 * derived from real hotel data (not hardcoded), with loading / empty / error
 * states while suggestions load.
 */
const SearchModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectSearch);

  const [destination, setDestination] = useState(search.destination || "");
  const [checkIn, setCheckIn] = useState(search.checkIn || daysFromNow(1));
  const [checkOut, setCheckOut] = useState(search.checkOut || daysFromNow(3));
  const [adults, setAdults] = useState(search.guests?.adults || 2);
  const [category, setCategory] = useState(search.category || "");
  const [starRating, setStarRating] = useState(search.rating || "");
  const [minPrice, setMinPrice] = useState(search.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(search.maxPrice || "");
  const [sort, setSort] = useState(search.sort || "recommended");
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState({});

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  // Re-seed the form with the last search whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setDestination(search.destination || "");
    setCheckIn(search.checkIn || daysFromNow(1));
    setCheckOut(search.checkOut || daysFromNow(3));
    setAdults(search.guests?.adults || 2);
    setCategory(search.category || "");
    setStarRating(search.rating || "");
    setMinPrice(search.minPrice || "");
    setMaxPrice(search.maxPrice || "");
    setSort(search.sort || "recommended");
    setErrors({});
    setExpanded(false);
  }, [open, search]);

  const suggestionsQuery = useQuery({
    queryKey: SUGGESTIONS_KEY,
    queryFn: () => hotelService.getHotels({ limit: SUGGESTIONS_LIMIT }),
    enabled: open,
    staleTime: SUGGESTIONS_STALE_TIME,
  });

  /** Real destinations derived from the backend hotel catalogue. */
  const destinations = useMemo(() => {
    const hotels = suggestionsQuery.data?.data || [];
    const seen = new Set();
    const list = [];

    hotels.forEach((hotel) => {
      [hotel.address?.city, hotel.address?.country].forEach((value) => {
        const clean = typeof value === "string" ? value.trim() : "";
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(clean);
        }
      });
    });

    return list.sort((a, b) => a.localeCompare(b)).slice(0, 10);
  }, [suggestionsQuery.data]);

  const clearError = (key) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next = {};

    if (!checkIn) next.checkIn = "Please select a check-in date.";
    if (!checkOut) next.checkOut = "Please select a check-out date.";
    if (checkIn && checkOut && checkOut <= checkIn) {
      next.checkOut = "Check-out must be after check-in.";
    }
    if (!adults || adults < 1 || adults > 10) {
      next.adults = "Please select at least one guest.";
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (minPrice !== "" && maxPrice !== "" && min > max) {
      next.price = "Minimum price cannot be higher than the maximum.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      requestAnimationFrame(() => {
        if (next.checkIn) checkInRef.current?.focus();
        else if (next.checkOut) checkOutRef.current?.focus();
      });
    }
    return Object.keys(next).length === 0;
  };

  const go = (payload) => {
    dispatch(
      setFilters({
        destination,
        checkIn,
        checkOut,
        guests: { adults, children: 0, rooms: 1 },
        category,
        minPrice,
        maxPrice,
        rating: starRating,
        sort,
        ...payload,
      }),
    );
    onClose();
    navigate(ROUTES.HOTELS);
  };

  const submit = () => {
    if (!validate()) return;
    go({});
  };

  /** One-tap search from a suggested destination (preserves the old behaviour). */
  const submitDestination = (value) => {
    setDestination(value);
    go({ destination: value });
  };

  const resetRefine = () => {
    setCategory("");
    setStarRating("");
    setMinPrice("");
    setMaxPrice("");
    setSort("recommended");
    clearError("price");
  };

  const suggestionError = toErrorMessage(
    suggestionsQuery.error,
    "Couldn't load destinations.",
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search Luxury Stays"
      size="xl"
      tone="glass"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
        className="relative"
      >
        {/* Ambient gold glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-44 w-80 -translate-x-1/2 rounded-full bg-[#D4AF37]/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative space-y-6">
          {/* ── Destination ─────────────────────────────────────────────── */}
          <div>
            <Label icon={<MapPin size={13} />}>Destination</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#e7c977]">
                <Search size={17} />
              </span>
              <input
                autoFocus
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  clearError("destination");
                }}
                list="search-destinations"
                placeholder="City, country or resort…"
                aria-label="Search destination"
                className={`${inputCls} pl-11`}
              />
              <datalist id="search-destinations">
                {destinations.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            {errors.destination && (
              <FieldError>{errors.destination}</FieldError>
            )}

            {/* Popular destinations — sourced from the live hotel catalogue */}
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#d7ad43]/80">
                <TrendingUp size={12} /> Popular destinations
              </p>

              {suggestionsQuery.isLoading ? (
                <div className="flex flex-wrap gap-2" aria-busy="true">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-9 w-24 animate-pulse rounded-full bg-white/[0.06]"
                    />
                  ))}
                </div>
              ) : suggestionsQuery.isError ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-cream/50">{suggestionError}</p>
                  <button
                    type="button"
                    onClick={() => suggestionsQuery.refetch()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#e7c977] transition-colors hover:bg-[#D4AF37]/10"
                  >
                    <RotateCcw size={12} /> Retry
                  </button>
                </div>
              ) : destinations.length === 0 ? (
                <p className="text-xs text-cream/45">
                  No destination suggestions available right now — try a city or
                  country above.
                </p>
              ) : (
                <motion.div
                  variants={staggerContainer(0.05)}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-2"
                >
                  {destinations.map((name) => (
                    <motion.button
                      key={name}
                      type="button"
                      variants={fadeInUp}
                      onClick={() => submitDestination(name)}
                      className={chipCls()}
                    >
                      <MapPin size={12} />
                      {name}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Dates + guests ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0">
              <Label icon={<Calendar size={13} />}>Check-in</Label>
              <input
                ref={checkInRef}
                type="date"
                value={checkIn}
                min={daysFromNow(0)}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  clearError("checkIn");
                }}
                onClick={(e) => e.currentTarget.showPicker?.()}
                aria-label="Check-in date"
                className={`${inputCls} cursor-pointer`}
              />
              {errors.checkIn && <FieldError>{errors.checkIn}</FieldError>}
            </div>

            <div className="min-w-0">
              <Label icon={<Calendar size={13} />}>Check-out</Label>
              <input
                ref={checkOutRef}
                type="date"
                value={checkOut}
                min={checkIn || daysFromNow(0)}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  clearError("checkOut");
                }}
                onClick={(e) => e.currentTarget.showPicker?.()}
                aria-label="Check-out date"
                className={`${inputCls} cursor-pointer`}
              />
              {errors.checkOut && <FieldError>{errors.checkOut}</FieldError>}
            </div>

            <div className="min-w-0">
              <Label icon={<Users size={13} />}>Guests</Label>
              <div className="relative">
                <select
                  value={adults}
                  onChange={(e) => {
                    setAdults(Number(e.target.value));
                    clearError("adults");
                  }}
                  aria-label="Number of guests"
                  className={selectCls}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option
                      key={n}
                      value={n}
                      className="bg-[#0b0b0b] text-white"
                    >
                      {n} {n > 1 ? "guests" : "guest"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#d7ad43]"
                />
              </div>
              {errors.adults && <FieldError>{errors.adults}</FieldError>}
            </div>
          </div>

          {/* ── Refine filters ─────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/15 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e7c977]">
                <SlidersHorizontal size={14} /> Refine your search
              </span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="text-[#d7ad43]"
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 border-t border-[#D4AF37]/10 px-4 py-4">
                    {/* Property type */}
                    <div>
                      <Label>Property type</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(HOTEL_CATEGORIES).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              setCategory(category === cat ? "" : cat)
                            }
                            aria-pressed={category === cat}
                            className={chipCls(category === cat)}
                          >
                            {cat.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Star rating */}
                    <div>
                      <Label icon={<Star size={12} />}>Star rating</Label>
                      <div className="flex flex-wrap gap-2">
                        {STAR_OPTIONS.map((value) => {
                          const active = starRating === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setStarRating(active ? "" : value)}
                              aria-pressed={active}
                              aria-label={`${value} star${value > 1 ? "s" : ""}`}
                              className={chipCls(active)}
                            >
                              {value}
                              <Star
                                size={12}
                                className={
                                  active ? "text-[#0b0b0b]" : "text-[#d7ad43]"
                                }
                                fill="currentColor"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <Label>Price per night (INR)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          min="0"
                          value={minPrice}
                          onChange={(e) => {
                            setMinPrice(e.target.value);
                            clearError("price");
                          }}
                          placeholder="Minimum"
                          aria-label="Minimum price"
                          className={inputCls}
                        />
                        <input
                          type="number"
                          min="0"
                          value={maxPrice}
                          onChange={(e) => {
                            setMaxPrice(e.target.value);
                            clearError("price");
                          }}
                          placeholder="Maximum"
                          aria-label="Maximum price"
                          className={inputCls}
                        />
                      </div>
                      {errors.price && <FieldError>{errors.price}</FieldError>}
                    </div>

                    {/* Sort */}
                    <div>
                      <Label>Sort by</Label>
                      <div className="relative">
                        <select
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                          aria-label="Sort results"
                          className={selectCls}
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-[#0b0b0b] text-white"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#d7ad43]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={resetRefine}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-cream/45 transition-colors hover:text-[#e7c977]"
                      >
                        <RotateCcw size={12} /> Reset filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-cream/40">
              Live availability &amp; best rates across the luxury collection.
            </p>
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b8912c] via-[#d4af37] to-[#e7c977] px-9 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0b0b0b] shadow-[0_14px_44px_rgba(212,175,55,0.35)] transition-all duration-300 hover:shadow-[0_18px_56px_rgba(212,175,55,0.5)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7c977] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b] active:scale-[0.98] sm:w-auto"
            >
              <Search size={16} />
              Search
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SearchModal;
