import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency } from "@/utils/formatters";
import { Icon, Image } from "@/components/ui";
import { EASE } from "@/theme/animations";

const GOLD = "#d4af37";

const badges = (hotel, hasOffer) => {
  const list = [];

  if (hotel.isFeatured) {
    list.push({
      label: "FEATURED",
      cls: "border-[#d4af37]/40 bg-black/80 text-[#d4af37]",
    });
  }

  if (hasOffer) {
    list.push({
      label: "SPECIAL OFFER",
      cls: "border-[#d4af37]/50 bg-[#d4af37] text-black",
    });
  }

  return list;
};

const Rating = ({ hotel }) => {
  if (!hotel.avgRating || hotel.avgRating <= 0) return null;

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#d4af37]/30 bg-black/90 px-2.5 py-1 text-xs shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
      <Icon name="star" size={12} className="text-[#d4af37]" />
      <span className="font-semibold text-white">
        {hotel.avgRating.toFixed(1)}
      </span>
      <span className="text-white/40">({hotel.totalReviews || 0})</span>
    </div>
  );
};

const Cta = ({ hotel }) => (
  <Link
    to={buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id })}
    className="group/cta inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37] px-4 py-2.5 text-xs font-semibold tracking-wide text-black shadow-[0_8px_25px_rgba(212,175,55,0.16)] transition-all duration-300 hover:border-[#f1d875] hover:bg-[#f1d875] hover:shadow-[0_10px_35px_rgba(212,175,55,0.35)] sm:px-5 sm:py-3 sm:text-sm"
    aria-label={`View ${hotel.name}`}
  >
    <span>View Stay</span>
    <Icon
      name="arrowRight"
      size={15}
      className="transition-transform duration-300 group-hover/cta:translate-x-1"
    />
  </Link>
);

const ImageOverlay = ({ hotel, hasOffer }) => {
  const image = hotel.featuredImage?.url || hotel.images?.[0]?.url || "";

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#111] sm:aspect-[16/10]">
      <Image
        src={image}
        alt={hotel.name}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/20" />

      <div className="absolute left-4 top-4 flex max-w-[75%] flex-wrap gap-2">
        {badges(hotel, hasOffer).map((badge) => (
          <span
            key={badge.label}
            className={`rounded-full border px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] shadow-lg backdrop-blur-md ${badge.cls}`}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {hotel.avgRating > 0 && (
        <div className="absolute right-4 top-4">
          <Rating hotel={hotel} />
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d4af37]">
            Luxury Stay
          </p>
          <h3 className="truncate font-serif text-xl font-semibold tracking-wide text-white sm:text-2xl">
            {hotel.name}
          </h3>
        </div>

        <div className="hidden shrink-0 rounded-full border border-gold-300 bg-black/50 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur-md sm:block">
          {hotel.category}
        </div>
      </div>
    </div>
  );
};

const Amenities = ({ hotel, limit = 3 }) => {
  if (!hotel.amenities?.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {hotel.amenities.slice(0, limit).map((amenity) => (
        <span
          key={amenity._id}
          className="rounded-full border border-[#d4af37]/15 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/55 transition-colors duration-300 group-hover:border-[#d4af37]/30 group-hover:text-[#d4af37]"
        >
          {amenity.name}
        </span>
      ))}
      {hotel.amenities.length > limit && (
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/35">
          +{hotel.amenities.length - limit}
        </span>
      )}
    </div>
  );
};

const Location = ({ hotel }) => {
  const location = [hotel.address?.city, hotel.address?.country]
    .filter(Boolean)
    .join(", ");

  if (!location) return null;

  return (
    <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-white/45 sm:text-sm">
      <Icon name="mapPin" size={14} className="shrink-0 text-[#d4af37]" />
      <span className="truncate">{location}</span>
    </p>
  );
};

const Price = ({ hotel }) => (
  <div className="min-w-0">
    <span className="block text-[9px] font-medium uppercase tracking-[0.18em] text-white/35 sm:text-[10px]">
      Starting from
    </span>
    <div className="mt-1 flex items-baseline gap-1">
      <span className="font-serif text-xl font-semibold text-white sm:text-2xl">
        {formatCurrency(hotel.startingPrice)}
      </span>
      <span className="text-[10px] text-white/35 sm:text-xs">/ night</span>
    </div>
  </div>
);

const GridCard = memo(function GridCard({ hotel, hasOffer }) {
  return (
    <motion.article
      // The entrance is driven by the per-card wrapper in Hotels.jsx, which uses
      // a deterministic `animate` (always runs to completion). Cards must NOT
      // depend on IntersectionObserver (`whileInView`) to reach full opacity: a
      // missed in-view observation on mount — e.g. right after a hard refresh,
      // when the skeleton→card swap races lazy image loading — would leave the
      // card stuck at opacity:0, appearing as an invisible dark card.
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group relative flex min-w-0 w-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#080808] shadow-[0_15px_50px_rgba(0,0,0,0.18)] transition-all duration-500 hover:border-[#d4af37]/50 hover:shadow-[0_20px_70px_rgba(0,0,0,0.35),0_0_35px_rgba(212,175,55,0.14)]"
    >
      <div className="pointer-events-none absolute -inset-px z-10 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-[24px] ring-1 ring-[#d4af37]/40" />
      </div>

      <ImageOverlay hotel={hotel} hasOffer={hasOffer} />

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div className="min-w-0">
          <Location hotel={hotel} />
          <Amenities hotel={hotel} limit={3} />
        </div>

        <div className="mt-5 h-px w-full bg-gradient-to-r from-[#d4af37]/30 via-white/10 to-transparent" />

        <div className="mt-4 flex min-w-0 items-end justify-between gap-3">
          <Price hotel={hotel} />
          <Cta hotel={hotel} />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#d4af37] shadow-[0_0_18px_#d4af37] transition-all duration-700 group-hover:w-full" />
    </motion.article>
  );
});

const ListCard = memo(function ListCard({ hotel, hasOffer }) {
  return (
    <motion.article
      // Same as GridCard: never gate card visibility on whileInView — the parent
      // wrapper's deterministic animate guarantees the card reaches full opacity.
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group relative flex min-w-0 w-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#080808] shadow-[0_15px_50px_rgba(0,0,0,0.18)] transition-all duration-500 hover:border-[#d4af37]/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_35px_rgba(212,175,55,0.12)] sm:flex-row"
    >
      <div className="relative w-full shrink-0 overflow-hidden sm:w-[300px] lg:w-[360px]">
        <div className="relative aspect-[16/10] h-full min-h-[220px] w-full sm:aspect-auto">
          <Image
            src={hotel.featuredImage?.url || hotel.images?.[0]?.url || ""}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {badges(hotel, hasOffer).map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full border px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] shadow-lg backdrop-blur-md ${badge.cls}`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {hotel.avgRating > 0 && (
            <div className="absolute right-4 top-4">
              <Rating hotel={hotel} />
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6 lg:p-7">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d4af37]">
              Luxury Collection
            </p>
            <h3 className="mt-2 truncate font-serif text-xl font-semibold tracking-wide text-white transition-colors duration-300 group-hover:text-[#d4af37] sm:text-2xl">
              {hotel.name}
            </h3>
            <Location hotel={hotel} />
          </div>

          <div className="sm:hidden">
            <Rating hotel={hotel} />
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/45">
          {hotel.shortDescription ||
            hotel.description ||
            "Experience refined hospitality, exceptional comfort and an unforgettable luxury stay."}
        </p>

        <Amenities hotel={hotel} limit={4} />

        <div className="mt-auto pt-6">
          <div className="h-px w-full bg-gradient-to-r from-[#d4af37]/30 via-white/10 to-transparent" />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Price hotel={hotel} />
            <Cta hotel={hotel} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#d4af37] shadow-[0_0_18px_#d4af37] transition-all duration-700 group-hover:w-full" />
    </motion.article>
  );
});

const HotelCard = ({ hotel, view = "grid", hasOffer = false }) => {
  if (!hotel) return null;

  return view === "list" ? (
    <ListCard hotel={hotel} hasOffer={hasOffer} />
  ) : (
    <GridCard hotel={hotel} hasOffer={hasOffer} />
  );
};

export default memo(HotelCard);
