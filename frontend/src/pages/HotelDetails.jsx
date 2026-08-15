import { memo, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { hotelService, roomService, reviewService, attractionService } from "@/services";
import { Container, Section } from "@/components/layout";
import { SkeletonLoader, Icon, Breadcrumb, Accordion } from "@/components/ui";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Seo from "@/components/common/Seo";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { getFallbackAsset } from "@/constants/assets";

/** 1 min — revisit refetches in the background but renders cached results first. */
const QUERY_STALE_TIME = 60 * 1000;

/** "14:00" → "2:00 PM". Passes unknown strings through untouched. */
const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h)) return t;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${period}`;
};

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

/* ════════════════════════════════════════════════════════════════════════════
   Amenities grid
   ════════════════════════════════════════════════════════════════════════════ */

const AmenitiesSection = memo(function AmenitiesSection({ hotel }) {
  const amenities = hotel.amenities || [];
  if (!amenities.length) return null;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <SectionHeading eyebrow="Amenities">Amenities & services</SectionHeading>
      <motion.ul
        variants={staggerContainer(0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {amenities.map((a) => (
          <motion.li
            key={a._id}
            variants={fadeInUp}
            className="lux-glass-soft flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#D8D3C8]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" aria-hidden="true" />
            {a.name}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Available rooms — anchor target for the booking CTA
   ════════════════════════════════════════════════════════════════════════════ */

const RoomCard = memo(function RoomCard({ room, index }) {
  const image = room.primaryImage?.url || room.images?.[0]?.url || "";
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="lux-glass group flex flex-col overflow-hidden sm:flex-row"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-auto sm:w-64 sm:shrink-0">
        <img
          src={image || getFallbackAsset("room", index)}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
        {room.type && (
          <span className="lux-chip absolute left-4 top-4">{room.type}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#F8F6F0] transition-colors group-hover:text-[#E7C977]">
              {room.name}
            </h3>
            {room.view && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#A8A8A8]">
                <Icon name="mapPin" size={12} className="text-[#C9AB4B]" /> {room.view}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-serif text-xl font-semibold text-[#E7C977]">
              {formatCurrency(room.basePricePerNight)}
              <span className="text-xs font-normal text-[#A8A8A8]"> / night</span>
            </p>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-[#A8A8A8]">{room.description}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#A8A8A8]">
          {room.maxOccupancy?.adults > 0 && (
            <span className="inline-flex items-center gap-1">
              <Icon name="user" size={14} /> Up to {room.maxOccupancy.adults + (room.maxOccupancy.children || 0)} guests
            </span>
          )}
          {room.size > 0 && (
            <span className="inline-flex items-center gap-1">
              <Icon name="grid" size={14} /> {room.size} sq ft
            </span>
          )}
          {room.view && (
            <span className="inline-flex items-center gap-1">
              <Icon name="mapPin" size={14} /> {room.view}
            </span>
          )}
        </div>

        {room.amenities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 4).map((a, i) => (
              <span
                key={i}
                className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-2 py-0.5 text-[11px] text-[#E7C977]"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-end pt-5">
          <Link
            to={buildPath(ROUTES.ROOM_DETAIL, { id: room._id })}
            className="lux-btn-gold !px-5 !py-2.5 text-sm"
          >
            View room <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
});

const RoomsSection = memo(function RoomsSection({ rooms, loading, error, total }) {
  return (
    <div id="available-rooms" className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow="Rooms & suites">Available rooms</SectionHeading>
        <span className="text-sm text-[#77736B]">{total || rooms.length} room{rooms.length === 1 ? "" : "s"}</span>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader.Card key={i} tone="dark" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            tone="dark"
            icon={<Icon name="info" size={28} className="text-gold-500" />}
            title="Couldn't load rooms"
            description={error}
          />
        ) : rooms.length === 0 ? (
          <EmptyState
            tone="dark"
            icon={<Icon name="calendar" size={28} className="text-gold-500" />}
            title="No rooms available right now"
            description="Please check back soon or contact the hotel directly for rates."
          />
        ) : (
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-4"
          >
            {rooms.map((room, index) => (
              <RoomCard key={room._id} room={room} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Reviews — rating breakdown + verified review cards
   ════════════════════════════════════════════════════════════════════════════ */

const RatingBreakdown = memo(function RatingBreakdown({ breakdown }) {
  if (!breakdown || !breakdown.length) return null;
  return (
    <div className="lux-glass-soft h-fit p-5">
      <h3 className="text-sm font-semibold text-[#E7C977]">Guest rating breakdown</h3>
      <ul className="mt-4 space-y-2.5">
        {breakdown.map((row) => (
          <li key={row.key}>
            <div className="flex items-center justify-between text-xs text-[#A8A8A8]">
              <span>{row.label}</span>
              <span className="font-medium text-[#F5F1E8]">{row.avg.toFixed(1)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#D4AF37]/15" role="presentation">
              <div
                className="h-full rounded-full bg-[#D4AF37]"
                style={{ width: `${(row.avg / 5) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

const ReviewCard = memo(function ReviewCard({ review }) {
  const user = review.user || {};
  const avatar = user.avatar || "";
  const initials = (user.name || "G")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <article className="lux-glass p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={user.name || "Guest avatar"}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-[#D4AF37]/40"
              loading="lazy"
            />
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15 font-serif text-sm font-semibold text-[#E7C977]"
              aria-hidden="true"
            >
              {initials}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-[#F8F6F0]">
              {user.name || "Verified guest"}
              {review.isVerified && (
                <span className="ml-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-medium text-[#E7C977]">
                  Verified stay
                </span>
              )}
            </p>
            <p className="text-xs text-[#77736B]">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StarRating value={review.rating?.overall || 0} />
        </div>
      </div>

      {review.title && (
        <h4 className="mt-3 font-medium text-[#F5F1E8]">{review.title}</h4>
      )}
      <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-[#B8B2A5]">{review.body}</p>

      {review.response?.text && (
        <div className="mt-3 rounded-lg border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C9AB4B]">Hotel response</p>
          <p className="mt-1 text-sm text-[#B8B2A5]">{review.response.text}</p>
        </div>
      )}

      {review.helpfulVotes > 0 && (
        <p className="mt-3 text-xs text-[#77736B]">
          <span className="font-medium text-[#E7C977]">{review.helpfulVotes}</span> guest
          {review.helpfulVotes > 1 ? "s" : ""} found this helpful
        </p>
      )}
    </article>
  );
});

const ReviewsSection = memo(function ReviewsSection({
  reviews,
  total,
  loading,
  error,
  breakdown,
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow="Guest stories">Guest reviews</SectionHeading>
        <span className="text-sm text-[#77736B]">
          {total || reviews.length} review{reviews.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader.Card key={i} tone="dark" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            tone="dark"
            icon={<Icon name="info" size={28} className="text-gold-500" />}
            title="Couldn't load reviews"
            description={error}
          />
        ) : reviews.length === 0 ? (
          <EmptyState
            tone="dark"
            icon={<Icon name="star" size={28} className="text-gold-500" />}
            title="No reviews yet"
            description="Be the first to share your experience after your stay."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <RatingBreakdown breakdown={breakdown} />
            <motion.div
              variants={staggerContainer(0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="space-y-4"
            >
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Policies — accessible accordion
   ════════════════════════════════════════════════════════════════════════════ */

const PoliciesSection = memo(function PoliciesSection({ hotel }) {
  const p = hotel.policies || {};
  const items = [
    {
      title: "Check-in & check-out",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="text-[#A8A8A8]">Check-in</span>
            <p className="font-medium text-[#F5F1E8]">{formatTime(p.checkIn)}</p>
          </div>
          <div>
            <span className="text-[#A8A8A8]">Check-out</span>
            <p className="font-medium text-[#F5F1E8]">{formatTime(p.checkOut)}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Cancellation policy",
      content: p.cancellation || "Free cancellation up to 24 hours before check-in.",
    },
    {
      title: "House rules",
      content: (
        <ul className="space-y-1.5">
          <li>Pets {p.petsAllowed ? "are welcome" : "are not permitted"}.</li>
          <li>Smoking {p.smokingAllowed ? "is permitted in designated areas" : "is not permitted"}.</li>
          <li>Children {p.childrenAllowed ? "are welcome" : "are not permitted"}.</li>
        </ul>
      ),
    },
  ];
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <SectionHeading eyebrow="Good to know">Hotel policies</SectionHeading>
      <div className="mt-6">
        <Accordion items={items} defaultOpen={[0]} tone="dark" />
      </div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Map — Google Maps embed from hotel coordinates (no API key needed)
   ════════════════════════════════════════════════════════════════════════════ */

const MapSection = memo(function MapSection({ hotel }) {
  const coords = hotel.location?.coordinates || [];
  const [lng, lat] = coords;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  if (!hasCoords) return null;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <SectionHeading eyebrow="Find us">Location</SectionHeading>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-[#A8A8A8]">
        <Icon name="mapPin" size={14} className="text-[#C9AB4B]" />
        {[hotel.address?.street, hotel.address?.city, hotel.address?.state, hotel.address?.country]
          .filter(Boolean)
          .join(", ")}
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#D4AF37]/20">
        <iframe
          title={`Map showing the location of ${hotel.name}`}
          src={`https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          className="h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Nearby places (attractions)
   ════════════════════════════════════════════════════════════════════════════ */

const NearbyPlacesSection = memo(function NearbyPlacesSection({ places, loading, error }) {
  if (error) return null;
  if (!loading && !places.length) return null;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <SectionHeading eyebrow="Explore around">Nearby places</SectionHeading>
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLoader.Card key={i} tone="dark" />
            ))}
          </div>
        ) : (
          <motion.ul
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {places.map((place, index) => (
              <motion.li key={place._id} variants={fadeInUp} className="lux-glass group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {place.image ? (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1A1A1A]">
                      <Icon name="mapPin" size={28} className="text-[#C9AB4B]" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-[#F8F6F0]">{place.name}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[#A8A8A8]">
                    {[place.category, place.distance].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Similar / nearby hotels
   ════════════════════════════════════════════════════════════════════════════ */

const SimilarHotelsSection = memo(function SimilarHotelsSection({ hotels }) {
  if (!hotels.length) return null;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <SectionHeading eyebrow="Keep exploring">Similar hotels</SectionHeading>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {hotels.map((hotel, index) => {
          const image = hotel.primaryImage?.url || hotel.images?.[0]?.url || "";
          return (
            <motion.article
              key={hotel._id}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="lux-glass group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={image || getFallbackAsset("hotel", index)}
                  alt={hotel.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
                {hotel.avgRating > 0 && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-[#F8F6F0] backdrop-blur">
                    <Icon name="star" size={12} className="text-[#D4AF37]" /> {hotel.avgRating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-lg font-medium text-[#F8F6F0] transition-colors group-hover:text-[#E7C977]">
                  {hotel.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-[#A8A8A8]">
                  <Icon name="mapPin" size={13} className="text-[#C9AB4B]" />
                  {[hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ")}
                </p>
                <Link
                  to={buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id })}
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-[#E7C977] hover:text-[#F1D477]"
                >
                  View hotel <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Sticky booking panel
   ════════════════════════════════════════════════════════════════════════════ */

const BookingPanel = memo(function BookingPanel({ hotel, startingPrice, roomCount }) {
  const scrollToRooms = useCallback(() => {
    document
      .getElementById("available-rooms")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="lux-glass p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="lux-eyebrow">Starting from</p>
          {startingPrice ? (
            <p className="mt-2 font-serif text-3xl font-medium text-[#F1D477]">
              {formatCurrency(startingPrice)}
              <span className="text-sm font-normal text-[#A8A8A8]"> / night</span>
            </p>
          ) : (
            <p className="mt-2 font-serif text-xl text-[#A8A8A8]">Rates on request</p>
          )}
        </div>
        {hotel.avgRating > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-[#D4AF37]/10 px-2.5 py-1 text-sm font-semibold text-[#F1D477]">
            <Icon name="star" size={14} className="text-[#D4AF37]" />
            {hotel.avgRating.toFixed(1)}
          </div>
        )}
      </div>

      <ul className="mt-6 space-y-3 text-sm text-[#A8A8A8]">
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="calendar" size={16} className="text-[#C9AB4B]" /> Check-in
          </span>
          <span className="font-medium text-[#F5F1E8]">{formatTime(hotel.policies?.checkIn)}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="calendar" size={16} className="text-[#C9AB4B]" /> Check-out
          </span>
          <span className="font-medium text-[#F5F1E8]">{formatTime(hotel.policies?.checkOut)}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="shield" size={16} className="text-[#C9AB4B]" /> Cancellation
          </span>
          <span className="font-medium text-[#F5F1E8]">Free</span>
        </li>
      </ul>

      <Button
        variant="gold"
        size="lg"
        className="mt-7 w-full"
        onClick={scrollToRooms}
        disabled={roomCount === 0}
      >
        {roomCount > 0
          ? `Check availability · ${roomCount} room${roomCount > 1 ? "s" : ""}`
          : "Rooms unavailable"}
      </Button>
      <p className="mt-3 text-center text-xs text-[#77736B]">
        Free cancellation up to 24 hours before check-in
      </p>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   Page skeleton (hotel loading state)
   ════════════════════════════════════════════════════════════════════════════ */

const HotelDetailsSkeleton = () => (
  <div aria-busy="true" aria-label="Loading hotel details" className="bg-[#050505]">
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
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-10">
            <SkeletonLoader.Card tone="dark" />
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
   Hotel Details page
   ════════════════════════════════════════════════════════════════════════════ */

const HotelDetails = () => {
  const { id } = useParams();

  const hotelQuery = useQuery({
    queryKey: ["hotel", id],
    queryFn: () => hotelService.getHotel(id),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME,
  });
  const roomsQuery = useQuery({
    queryKey: ["rooms", "hotel", id],
    queryFn: () => roomService.getByHotel(id, { limit: 50 }),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME,
  });
  const reviewsQuery = useQuery({
    queryKey: ["reviews", "hotel", id, 6],
    queryFn: () => reviewService.getByHotel(id, { limit: 6 }),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME,
  });

  const hotel = hotelQuery.data?.data;
  const rooms = roomsQuery.data?.data || [];
  const roomTotal = roomsQuery.data?.pagination?.total;
  const reviews = reviewsQuery.data?.data || [];
  const reviewTotal = reviewsQuery.data?.pagination?.total;

  const hotelError = hotelQuery.isError
    ? toErrorMessage(hotelQuery.error, "Could not load this hotel.")
    : null;
  const roomsError = roomsQuery.isError
    ? toErrorMessage(roomsQuery.error, "Could not load rooms.")
    : null;
  const reviewsError = reviewsQuery.isError
    ? toErrorMessage(reviewsQuery.error, "Could not load reviews.")
    : null;

  // Nearby places + similar hotels depend on the hotel's coordinates.
  const coords = hotel?.location?.coordinates || [];
  const [lng, lat] = coords;
  const hasCoords = Boolean(hotel) && Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  const attractionsQuery = useQuery({
    queryKey: ["attractions", "nearby", lng, lat],
    queryFn: () =>
      attractionService.getNearby({ lat, lng, limit: 4 }),
    enabled: hasCoords,
    staleTime: 5 * 60 * 1000,
  });

  const similarQuery = useQuery({
    queryKey: ["hotels", "similar", id, hasCoords ? "nearby" : "featured"],
    queryFn: () =>
      hasCoords
        ? hotelService.getNearby({ lat, lng, limit: 6 })
        : hotelService.getFeaturedHotels({ limit: 6 }),
    enabled: Boolean(hotel),
    staleTime: QUERY_STALE_TIME,
  });

  const places = attractionsQuery.data?.data || [];
  const similar = (similarQuery.data?.data || []).filter((h) => String(h._id) !== String(id));

  // Cheapest room / availability, derived once per rooms payload.
  const { startingPrice, hasRooms } = useMemo(() => {
    const prices = rooms.map((r) => Number(r.basePricePerNight) || 0);
    const min = prices.length ? Math.min(...prices) : 0;
    return { startingPrice: min > 0 ? min : null, hasRooms: rooms.length > 0 };
  }, [rooms]);

  // Aggregate review ratings per category for the breakdown panel.
  const ratingBreakdown = useMemo(() => {
    const CATEGORIES = [
      { key: "overall", label: "Overall" },
      { key: "cleanliness", label: "Cleanliness" },
      { key: "service", label: "Service" },
      { key: "location", label: "Location" },
      { key: "value", label: "Value" },
      { key: "comfort", label: "Comfort" },
    ];
    if (!reviews.length) return null;
    return CATEGORIES.map((c) => {
      const values = reviews
        .map((r) => r.rating?.[c.key])
        .filter((v) => typeof v === "number");
      if (!values.length) return null;
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      return { key: c.key, label: c.label, avg };
    }).filter(Boolean);
  }, [reviews]);

  const cityLine = hotel
    ? [hotel.address?.city, hotel.address?.state, hotel.address?.country].filter(Boolean).join(", ")
    : "";

  const description = hotel?.seoMeta?.description || hotel?.shortDescription || hotel?.description;

  const scrollToRooms = useCallback(() => {
    document
      .getElementById("available-rooms")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const heroImage = hotel?.primaryImage?.url || hotel?.images?.[0]?.url || getFallbackAsset("hotel", 0);
  const heroDescription = hotel?.shortDescription || (description ? String(description).slice(0, 180) : "");

  return (
    <>
      <Seo
        title={hotel ? `${hotel.name} · ${cityLine}` : "Hotel"}
        description={description ? String(description).slice(0, 160) : undefined}
        image={hotel?.primaryImage?.url || hotel?.images?.[0]?.url}
        type="article"
      />

      {hotelQuery.isLoading ? (
        <HotelDetailsSkeleton />
      ) : hotelError ? (
        <div className="bg-[#050505] py-20">
          <Container>
            <EmptyState
              tone="dark"
              icon={<Icon name="info" size={32} className="text-gold-500" />}
              title="Hotel not found"
              description={hotelError}
              action={
                <Link
                  to={ROUTES.HOTELS}
                  className="btn-gold"
                >
                  Browse all hotels
                </Link>
              }
            />
          </Container>
        </div>
      ) : hotel ? (
        <>
          {/* Cinematic hero */}
          <section className="relative bg-black">
            <div className="absolute inset-0" aria-hidden="true">
              <img
                src={heroImage}
                alt=""
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-[#050505]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_120%,rgba(212,175,55,0.16),transparent_70%)]" />
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
              aria-hidden="true"
            />

            <div className="relative z-10 container-lux flex min-h-[78vh] flex-col justify-end pb-16 pt-32 sm:pt-36">
              <Breadcrumb
                tone="dark"
                className="mb-6"
                items={[
                  { label: "Home", to: ROUTES.HOME },
                  { label: "Hotels", to: ROUTES.HOTELS },
                  { label: hotel.name },
                ]}
              />
              <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible">
                {hotel.category && (
                  <motion.span variants={fadeInUp} className="lux-chip mb-6">
                    {hotel.category}
                  </motion.span>
                )}
                <motion.h1
                  variants={fadeInUp}
                  className="max-w-4xl font-serif text-4xl font-semibold leading-[1.08] text-[#F8F6F0] sm:text-5xl lg:text-6xl"
                >
                  {hotel.name}
                </motion.h1>
                <motion.div
                  variants={fadeInUp}
                  className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#B8B2A5]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="mapPin" size={15} className="text-[#E7C977]" /> {cityLine}
                  </span>
                  {hotel.avgRating > 0 && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#F8F6F0]">
                      <Icon name="star" size={15} className="text-[#D4AF37]" />
                      {hotel.avgRating.toFixed(1)}
                      <span className="font-normal text-[#A8A8A8]">({hotel.totalReviews || 0} reviews)</span>
                    </span>
                  )}
                </motion.div>
                {heroDescription && (
                  <motion.p variants={fadeInUp} className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#C9C4B8]">
                    {heroDescription}
                  </motion.p>
                )}
                <motion.div variants={fadeInUp} className="mt-9 flex flex-wrap items-center gap-4">
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={scrollToRooms}
                    disabled={!hasRooms}
                  >
                    View Available Rooms <Icon name="arrowRight" size={16} />
                  </Button>
                  <Link to={ROUTES.HOTELS} className="lux-btn-ghost">
                    Browse all hotels
                  </Link>
                </motion.div>
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
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-12">
                  {/* About */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="lux-glass p-6 sm:p-8"
                  >
                    <SectionHeading eyebrow="The stay">About this hotel</SectionHeading>
                    <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-[#B8B2A5]">
                      {hotel.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#A8A8A8]">
                      {hotel.contact?.phone && (
                        <p className="flex items-center gap-2">
                          <Icon name="phone" size={15} className="text-[#C9AB4B]" />
                          {hotel.contact.phone}
                        </p>
                      )}
                      {hotel.contact?.email && (
                        <p className="flex items-center gap-2">
                          <Icon name="mail" size={15} className="text-[#C9AB4B]" />
                          {hotel.contact.email}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  <AmenitiesSection hotel={hotel} />

                  <RoomsSection
                    rooms={rooms}
                    loading={roomsQuery.isLoading}
                    error={roomsError}
                    total={roomTotal}
                  />

                  <ReviewsSection
                    reviews={reviews}
                    total={reviewTotal}
                    loading={reviewsQuery.isLoading}
                    error={reviewsError}
                    breakdown={ratingBreakdown}
                  />

                  <PoliciesSection hotel={hotel} />

                  <MapSection hotel={hotel} />

                  <NearbyPlacesSection
                    places={places}
                    loading={attractionsQuery.isLoading}
                    error={attractionsQuery.isError ? "Could not load nearby places." : null}
                  />

                  <SimilarHotelsSection hotels={similar} />
                </div>

                <aside className="lg:pt-1">
                  <div className="space-y-6 lg:sticky lg:top-24">
                    <BookingPanel
                      hotel={hotel}
                      startingPrice={startingPrice}
                      roomCount={hasRooms ? rooms.length : 0}
                    />
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

export default HotelDetails;
