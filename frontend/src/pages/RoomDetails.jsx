import { memo, useCallback, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { roomService, reviewService } from "@/services";
import { Container, Section } from "@/components/layout";
import { SkeletonLoader, Icon, Breadcrumb } from "@/components/ui";
import Gallery from "@/components/ui/Gallery";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Seo from "@/components/common/Seo";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toISODate, addDays, fromISODate, daysBetween, formatISODate } from "@/utils/dates";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { getFallbackAsset } from "@/constants/assets";

/** 1 min — revisit refetches in the background but renders cached results first. */
const QUERY_STALE_TIME = 60 * 1000;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const capitalize = (s = "") => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Dark-luxury section heading: gold eyebrow + serif ivory title. */
const SectionHeading = memo(function SectionHeading({ eyebrow, children, className = "" }) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="lux-eyebrow mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-[#D4AF37]/60" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className="lux-h2">{children}</h2>
    </div>
  );
});

/** Monday-first grid of cells (null = leading blank). */
const buildMonthCells = (year, month) => {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
};

/* ════════════════════════════════════════════════════════════════════════════
   Availability calendar — live blocked-dates heatmap (current + next month)
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Normalize the blocked-dates payload into a plain array of `YYYY-MM-DD`
 * strings. The backend accepts `?startDate=&endDate=` and returns them inside
 * the standard API envelope as `data.blockedDates: [...]`. `roomService` keeps
 * the project convention of resolving `.then((res) => res.data)` (the whole
 * envelope), so the page reads `query.data?.data?.blockedDates`. The calendar
 * ALSO guards against a transiently different shape (bare array / `{ data }`)
 * so a data-shape hiccup degrades to "all available" instead of crashing the
 * whole page with "object is not iterable".
 */
const normalizeBlockedDates = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.blockedDates)) return value.blockedDates;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const AvailabilityCalendar = memo(function AvailabilityCalendar({ blockedDates = [] }) {
  const blocked = useMemo(
    () => new Set(normalizeBlockedDates(blockedDates)),
    [blockedDates]
  );
  const today = new Date();
  const todayIso = toISODate(today);
  const months = useMemo(() => {
    const base = new Date(today.getFullYear(), today.getMonth(), 1);
    return [0, 1].map((m) => {
      const d = new Date(base.getFullYear(), base.getMonth() + m, 1);
      return {
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        cells: buildMonthCells(d.getFullYear(), d.getMonth()),
      };
    });
    // First render only — the range is fixed at +60 days from load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        {months.map((month) => (
          <div key={month.label} className="lux-glass-soft p-4">
            <p className="mb-3 text-center text-sm font-semibold text-[#F1D477]">{month.label}</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="text-[11px] font-medium uppercase text-[#77736B]">
                  {w}
                </span>
              ))}
              {month.cells.map((date, i) => {
                if (!date) return <span key={`e-${i}`} aria-hidden="true" />;
                const iso = toISODate(date);
                const isBlocked = blocked.has(iso);
                const isToday = iso === todayIso;
                return (
                  <span
                    key={iso}
                    title={isBlocked ? "Sold out" : "Available"}
                    className={`flex h-8 items-center justify-center rounded-md text-xs ${
                      isBlocked ? "bg-[#D4AF37]/10 text-[#D4AF37]/60 line-through" : "text-[#D8D3C8]"
                    } ${isToday ? "ring-1 ring-[#D4AF37]" : ""}`}
                  >
                    {date.getDate()}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#A8A8A8]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF37]/20" aria-hidden="true" /> Sold out
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-[#D4AF37]/30" aria-hidden="true" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-[#D4AF37]" aria-hidden="true" /> Today
        </span>
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Per-night price breakdown from the live availability pricing payload
   ════════════════════════════════════════════════════════════════════════════ */

const PriceBreakdown = memo(function PriceBreakdown({ pricing }) {
  if (!pricing) return null;
  return (
    <div className="mt-5 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-4 text-sm">
      <p className="font-medium text-[#F5F1E8]">
        {pricing.nights} night{pricing.nights > 1 ? "s" : ""}
      </p>
      <ul className="mt-3 space-y-1.5">
        {(pricing.breakdown || []).map((row) => (
          <li key={row.date} className="flex items-center justify-between text-[#A8A8A8]">
            <span className="flex items-center gap-2">
              {formatISODate(row.date)}
              {row.isWeekend && (
                <span className="rounded-full bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#E7C977]">
                  weekend
                </span>
              )}
            </span>
            <span className="font-medium text-[#F5F1E8]">{formatCurrency(row.price)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1 border-t border-[#D4AF37]/15 pt-3 text-[#A8A8A8]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(pricing.baseAmount)}</span>
        </div>
        {pricing.discountAmount > 0 && (
          <div className="flex justify-between text-[#E7C977]">
            <span>Discount</span>
            <span>− {formatCurrency(pricing.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Taxes & fees</span>
          <span>{formatCurrency(pricing.taxAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-[#D4AF37]/15 pt-2 text-base font-semibold text-[#F1D477]">
          <span>Total</span>
          <span>{formatCurrency(pricing.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Sticky booking widget — dates + guests → live availability + price
   ════════════════════════════════════════════════════════════════════════════ */

const BookingWidget = memo(function BookingWidget({ room, hotel }) {
  const navigate = useNavigate();
  const maxAdults = room.maxOccupancy?.adults || 4;
  const maxChildren = room.maxOccupancy?.children || 2;

  const [checkIn, setCheckIn] = useState(() => toISODate(new Date()));
  const [checkOut, setCheckOut] = useState(() => toISODate(addDays(new Date(), 1)));
  const [adults, setAdults] = useState(room.maxOccupancy?.adults || 2);
  const [children, setChildren] = useState(0);

  const datesValid = Boolean(checkIn && checkOut) && daysBetween(checkIn, checkOut) >= 1;

  const availabilityQuery = useQuery({
    queryKey: ["room", room._id, "availability", checkIn, checkOut],
    queryFn: () => roomService.getAvailability(room._id, { checkIn, checkOut }),
    enabled: datesValid,
    staleTime: QUERY_STALE_TIME,
  });

  const availability = availabilityQuery.data?.data;
  const pricing = availability?.pricing;
  const isAvailable = Boolean(availability?.isAvailable);

  const handleCheckIn = useCallback(
    (value) => {
      setCheckIn(value);
      if (value && daysBetween(value, checkOut) < 1) {
        setCheckOut(toISODate(addDays(fromISODate(value), 1)));
      }
    },
    [checkOut]
  );

  const goToBooking = useCallback(() => {
    const qs = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
    });
    navigate(`${buildPath(ROUTES.BOOKING, { roomId: room._id })}?${qs.toString()}`);
  }, [navigate, room._id, checkIn, checkOut, adults, children]);

  return (
    <div id="booking-widget" className="lux-glass p-6 sm:p-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="lux-eyebrow">Per night from</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-[#F1D477]">
            {formatCurrency(room.basePricePerNight)}
          </p>
        </div>
        {hotel?.avgRating > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1 text-sm font-semibold text-[#F8F6F0]">
            <Icon name="star" size={14} className="text-[#D4AF37]" />
            {hotel.avgRating.toFixed(1)}
          </div>
        )}
      </div>

      {room.weekendPremium > 0 && (
        <p className="mt-1 text-xs text-[#77736B]">
          {room.weekendPremium}% premium applies on weekends
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="room-check-in" className="lux-label-gold">Check-in</label>
          <input
            id="room-check-in"
            type="date"
            className="lux-input-solid"
            min={toISODate(new Date())}
            value={checkIn}
            onClick={(e) => e.currentTarget.showPicker?.()}
            onChange={(e) => handleCheckIn(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="room-check-out" className="lux-label-gold">Check-out</label>
          <input
            id="room-check-out"
            type="date"
            className="lux-input-solid"
            onClick={(e) => e.currentTarget.showPicker?.()}
            min={toISODate(addDays(fromISODate(checkIn), 1))}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="room-adults" className="lux-label-gold">Adults</label>
          <select
            id="room-adults"
            className="lux-input-solid"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
          >
            {Array.from({ length: maxAdults }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="room-children" className="lux-label-gold">Children</label>
          <select
            id="room-children"
            className="lux-input-solid"
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
          >
            {Array.from({ length: maxChildren + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {datesValid && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-[#A8A8A8]">
            {daysBetween(checkIn, checkOut)} night{daysBetween(checkIn, checkOut) > 1 ? "s" : ""}
          </span>
          {availabilityQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-[#A8A8A8]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]" aria-hidden="true" />
              Checking availability…
            </span>
          ) : isAvailable ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-[#F5F1E8]">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" aria-hidden="true" />
              {availability.availableUnits} room{availability.availableUnits > 1 ? "s" : ""} left
            </span>
          ) : (
            <span className="font-medium text-red-300">Sold out on these dates</span>
          )}
        </div>
      )}

      <PriceBreakdown pricing={pricing} />

      <Button
        variant="gold"
        size="lg"
        className="mt-6 w-full"
        onClick={goToBooking}
        disabled={!datesValid || availabilityQuery.isLoading || (datesValid && !isAvailable)}
        loading={availabilityQuery.isLoading}
      >
        Reserve this room
      </Button>
      <p className="mt-3 text-center text-xs text-[#77736B]">
        {hotel?.policies?.cancellation || "Free cancellation up to 24 hours before check-in"}
      </p>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Highlights + hotel reviews strip + more rooms
   ════════════════════════════════════════════════════════════════════════════ */

const Highlights = memo(function Highlights({ room }) {
  const items = [];
  if (room.maxOccupancy?.adults) {
    items.push({
      icon: "user",
      label: "Guests",
      value: `Up to ${room.maxOccupancy.adults + (room.maxOccupancy.children || 0)}`,
    });
  }
  if (room.size > 0) items.push({ icon: "grid", label: "Size", value: `${room.size} sq ft` });
  if (room.view) items.push({ icon: "mapPin", label: "View", value: room.view });
  if (room.bedConfiguration) items.push({ icon: "list", label: "Beds", value: room.bedConfiguration });
  if (room.type) items.push({ icon: "star", label: "Type", value: capitalize(room.type) });

  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="lux-glass-soft flex flex-col items-center gap-1 p-4 text-center">
          <Icon name={item.icon} size={20} className="text-[#E7C977]" />
          <p className="text-xs text-[#77736B]">{item.label}</p>
          <p className="text-sm font-medium text-[#F5F1E8]">{item.value}</p>
        </div>
      ))}
    </div>
  );
});

const ReviewCard = memo(function ReviewCard({ review }) {
  const user = review.user || {};
  const avatar = user.avatar || "";
  return (
    <article className="lux-glass p-4">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={user.name || "Guest"}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-[#D4AF37]/40"
            loading="lazy"
          />
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/15 text-xs font-semibold text-[#E7C977]"
            aria-hidden="true"
          >
            {(user.name || "G").slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-[#F8F6F0]">{user.name || "Verified guest"}</p>
          <p className="text-xs text-[#77736B]">{formatDate(review.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <StarRating value={review.rating?.overall || 0} />
        </div>
      </div>
      {review.title && <h4 className="mt-3 text-sm font-medium text-[#F5F1E8]">{review.title}</h4>}
      <p className="mt-1 line-clamp-3 text-sm text-[#B8B2A5]">{review.body}</p>
    </article>
  );
});

const HotelReviewsStrip = memo(function HotelReviewsStrip({ reviews, hotel }) {
  if (!reviews.length) return null;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow="Guest stories">What guests say</SectionHeading>
        {hotel?._id && (
          <Link
            to={buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E7C977] transition-colors hover:text-[#F1D477]"
          >
            All reviews <Icon name="arrowRight" size={14} />
          </Link>
        )}
      </div>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-5 grid gap-4 sm:grid-cols-3"
      >
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </motion.div>
    </div>
  );
});

const MoreRoomsSection = memo(function MoreRoomsSection({ rooms }) {
  if (!rooms.length) return null;
  return (
    <div>
      <SectionHeading eyebrow="At this hotel">More rooms & suites</SectionHeading>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {rooms.map((room, index) => {
          const image = room.primaryImage?.url || room.images?.[0]?.url || "";
          return (
            <motion.article
              key={room._id}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="lux-glass group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={image || getFallbackAsset("room", index)}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-lg font-medium text-[#F8F6F0] transition-colors group-hover:text-[#E7C977]">
                  {room.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-[#A8A8A8]">{room.description}</p>
                <div className="mt-auto flex items-end justify-between pt-4">
                  <p className="font-serif text-lg font-semibold text-[#E7C977]">
                    {formatCurrency(room.basePricePerNight)}
                    <span className="text-xs font-normal text-[#A8A8A8]"> / night</span>
                  </p>
                  <Link
                    to={buildPath(ROUTES.ROOM_DETAIL, { id: room._id })}
                    className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-[#F8F6F0] transition-colors hover:bg-[#D4AF37]/15 hover:text-[#E7C977]"
                  >
                    View <Icon name="arrowRight" size={12} />
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Page skeleton
   ════════════════════════════════════════════════════════════════════════════ */

const RoomDetailsSkeleton = () => (
  <div aria-busy="true" aria-label="Loading room details" className="bg-[#050505]">
    <Container className="pt-8 sm:pt-10">
      <SkeletonLoader.Text lines={1} className="max-w-xs" tone="dark" />
      <div className="mt-4">
        <SkeletonLoader.Text lines={2} className="max-w-lg" tone="dark" />
      </div>
    </Container>
    <Container className="mt-6">
      <SkeletonLoader.Image className="aspect-[16/9] rounded-2xl sm:aspect-[21/9]" tone="dark" />
    </Container>
    <Section className="pt-10">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-10">
            <SkeletonLoader.Card tone="dark" />
            <SkeletonLoader.Card tone="dark" />
          </div>
          <div>
            <SkeletonLoader.Card className="lg:sticky lg:top-24" tone="dark" />
          </div>
        </div>
      </Container>
    </Section>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   Room Details page
   ════════════════════════════════════════════════════════════════════════════ */

const RoomDetails = () => {
  const { id } = useParams();

  const roomQuery = useQuery({
    queryKey: ["room", id],
    queryFn: () => roomService.getRoom(id),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME,
  });

  const blockedRange = useMemo(() => {
    const today = new Date();
    // The backend blocked-dates endpoint reads `startDate`/`endDate`.
    return { startDate: toISODate(today), endDate: toISODate(addDays(today, 60)) };
  }, []);

  const blockedDatesQuery = useQuery({
    queryKey: ["room", id, "blocked-dates", blockedRange.startDate, blockedRange.endDate],
    queryFn: () => roomService.getBlockedDates(id, blockedRange),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

  const room = roomQuery.data?.data;
  const hotel = room?.hotel;
  const hotelId = hotel?._id;

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "hotel", hotelId, 3],
    queryFn: () => reviewService.getByHotel(hotelId, { limit: 3 }),
    enabled: Boolean(hotelId),
    staleTime: QUERY_STALE_TIME,
  });

  const moreRoomsQuery = useQuery({
    queryKey: ["rooms", "hotel", hotelId],
    queryFn: () => roomService.getByHotel(hotelId, { limit: 50 }),
    enabled: Boolean(hotelId),
    staleTime: QUERY_STALE_TIME,
  });

  const roomError = roomQuery.isError ? toErrorMessage(roomQuery.error, "Could not load this room.") : null;
  const reviews = reviewsQuery.data?.data || [];
  const moreRooms = (moreRoomsQuery.data?.data || []).filter((r) => String(r._id) !== String(id));
  // Backend contract: `data.blockedDates: [...]` inside the ApiResponse
  // envelope. Normalize anyway so an unexpected shape can never crash render.
  const blockedDates = normalizeBlockedDates(blockedDatesQuery.data?.data);

  const image = room?.primaryImage?.url || room?.images?.[0]?.url;

  const scrollToWidget = useCallback(() => {
    document
      .getElementById("booking-widget")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const cityLine = hotel
    ? [hotel.address?.city, hotel.address?.state, hotel.address?.country].filter(Boolean).join(", ")
    : "";

  return (
    <>
      <Seo
        title={room ? `${room.name} · ${hotel?.name || "Room"}` : "Room"}
        description={room?.description ? String(room.description).slice(0, 160) : undefined}
        image={image}
        type="article"
      />

      {roomQuery.isLoading ? (
        <RoomDetailsSkeleton />
      ) : roomError ? (
        <div className="bg-[#050505] py-20">
          <Container>
            <EmptyState
              tone="dark"
              icon={<Icon name="info" size={32} className="text-gold-500" />}
              title="Room not found"
              description={roomError}
              action={
                <Link to={ROUTES.HOTELS} className="btn-gold">
                  Browse all hotels
                </Link>
              }
            />
          </Container>
        </div>
      ) : room ? (
        <>
          {/* Cinematic hero */}
          <section className="relative bg-black">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_115%,rgba(212,175,55,0.12),transparent_70%)]"
              aria-hidden="true"
            />

            <div className="relative z-10 container-lux pt-0 sm:pt-12">
              <Breadcrumb
                tone="dark"
                className="pt-20"
                items={[
                  { label: "Home", to: ROUTES.HOME },
                  { label: "Hotels", to: ROUTES.HOTELS },
                  ...(hotel
                    ? [{ label: hotel.name, to: buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id }) }]
                    : []),
                  { label: room.name },
                ]}
              />

              <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible" className="mt-6">
                {room.type && (
                  <motion.span variants={fadeInUp} className="lux-chip mb-4">
                    {capitalize(room.type)}
                  </motion.span>
                )}
                <motion.h1
                  variants={fadeInUp}
                  className="max-w-4xl font-serif text-3xl font-semibold leading-tight text-[#F8F6F0] sm:text-4xl lg:text-5xl"
                >
                  {room.name}
                </motion.h1>
                <motion.div
                  variants={fadeInUp}
                  className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#B8B2A5]"
                >
                  {hotel && (
                    <Link
                      to={buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id })}
                      className="inline-flex items-center gap-1.5 font-medium text-[#E7C977] transition-colors hover:text-[#F1D477]"
                    >
                      <Icon name="mapPin" size={15} className="text-[#C9AB4B]" />
                      {cityLine || hotel.name}
                    </Link>
                  )}
                  {hotel?.avgRating > 0 && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#F8F6F0]">
                      <Icon name="star" size={15} className="text-[#D4AF37]" />
                      {hotel.avgRating.toFixed(1)}
                      <span className="font-normal text-[#A8A8A8]">({hotel.totalReviews || 0} reviews)</span>
                    </span>
                  )}
                  {room.view && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="eye" size={15} className="text-[#C9AB4B]" /> {room.view}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* Gallery */}
            <div className="relative z-10 container-lux mt-8 pb-12 sm:pb-14">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Gallery
                  images={room.images}
                  alt={room.name}
                  fallback={getFallbackAsset("room", 0)}
                  eager
                  overlay="bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  countClass="bg-black/70 text-[#F8F6F0]"
                  thumbInactiveRing="ring-1 ring-[#D4AF37]/25 hover:ring-[#D4AF37]/70"
                />

                {/* Price + booking CTA bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4AF37]/25 bg-black/60 px-4 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#C9AB4B]">Per night from</p>
                    <p className="font-serif text-2xl font-semibold text-[#F1D477] sm:text-3xl">
                      {formatCurrency(room.basePricePerNight)}
                    </p>
                  </div>
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={scrollToWidget}
                    className="w-full sm:w-auto"
                  >
                    Reserve this room <Icon name="arrowRight" size={16} />
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Body */}
          <section className="relative bg-[#050505]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
              aria-hidden="true"
            />
            <Container className="py-16 sm:py-20">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-14">
                  <Highlights room={room} />

                  {/* About */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                  >
                    <SectionHeading eyebrow="The stay">About this room</SectionHeading>
                    <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[#B8B2A5]">
                      {room.description}
                    </p>
                  </motion.div>

                  {/* Amenities */}
                  {room.amenities?.length > 0 && (
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-60px" }}
                    >
                      <SectionHeading eyebrow="Included">Room amenities</SectionHeading>
                      <motion.ul
                        variants={staggerContainer(0.05)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
                      >
                        {room.amenities.map((amenity, index) => (
                          <motion.li
                            key={amenity}
                            variants={fadeInUp}
                            className="lux-glass-soft flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#D8D3C8]"
                          >
                            <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" aria-hidden="true" />
                            {amenity}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {/* Availability calendar */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                  >
                    <SectionHeading eyebrow="Live calendar">Availability</SectionHeading>
                    <p className="mt-1 text-sm text-[#A8A8A8]">
                      Next 60 days — pick dates in the booking widget to confirm live pricing.
                    </p>
                    <div className="mt-4">
                      <AvailabilityCalendar blockedDates={blockedDates} />
                      {blockedDatesQuery.isError && (
                        <p className="mt-3 text-xs text-[#77736B]">
                          Availability temporarily unavailable — showing all dates as available.
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Cancellation */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                  >
                    <SectionHeading eyebrow="Good to know">Cancellation policy</SectionHeading>
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-5 text-sm text-[#B8B2A5]">
                      <Icon name="shield" size={18} className="mt-0.5 shrink-0 text-[#E7C977]" />
                      <p>{hotel?.policies?.cancellation || "Free cancellation up to 24 hours before check-in."}</p>
                    </div>
                  </motion.div>

                  <HotelReviewsStrip reviews={reviews} hotel={hotel} />

                  <MoreRoomsSection rooms={moreRooms} />
                </div>

                <aside className="lg:pt-1">
                  <div className="space-y-6 lg:sticky lg:top-24">
                    {room && hotel ? <BookingWidget room={room} hotel={hotel} /> : null}
                  </div>
                </aside>
              </div>
            </Container>
          </section>
        </>
      ) : null}
    </>
  );
};

export default RoomDetails;
