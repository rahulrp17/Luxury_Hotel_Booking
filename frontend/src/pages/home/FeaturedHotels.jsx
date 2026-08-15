import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SkeletonLoader } from "@/components/ui";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { ROUTES, buildPath } from "@/constants/routes";
import { Container, Section } from "@/components/layout";
import { fadeInUp, EASE } from "@/theme/animations";
import { buildResponsiveSrcSet } from "@/utils/helpers";

/* -------------------------------------------------------------------------- */
/*                                 HOTEL CARD                                 */
/* -------------------------------------------------------------------------- */

const HotelCard = memo(({ hotel, priority = false }) => {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{
        duration: 0.35,
        ease: EASE,
      }}
      className="group mx-auto my-10 w-full max-w-[320px] overflow-hidden rounded-2xl border border-[#2C2C2C] bg-[#0F0F0F] shadow-[0_15px_40px_rgba(0,0,0,.45)] transition-all duration-500 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,.45)] md:max-w-[275px] lg:max-w-[275px]"
    >
      {/* Image */}

      <div className="relative overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          srcSet={buildResponsiveSrcSet(hotel.image)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="h-[190px] w-[320px] object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category */}

        <span className="absolute left-4 top-4 rounded-full border border-[#D4AF37]/40 bg-black/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37] backdrop-blur-xl">
          {hotel.category}
        </span>

        {/* Rating */}

        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-[#D4AF37]/40 bg-[#141414]/90 px-3 py-1.5 text-sm font-semibold text-[#D4AF37] shadow-lg backdrop-blur-xl">
          <Star size={13} fill="currentColor" />
          {hotel.rating} ({hotel.totalReviews})
        </span>
      </div>

      {/* Content */}

      <div className="p-5">
        {/* Hotel Name */}

        <h3 className="font-serif text-[22px] font-semibold leading-tight text-white transition duration-300 group-hover:text-[#D4AF37]">
          {hotel.name}
        </h3>

        {/* City */}

        <div className="mt-3 flex items-center gap-2 text-[15px] text-[#B5B5B5]">
          <MapPin size={16} className="text-[#D4AF37]" />

          <span>{hotel.city}</span>
        </div>

        {/* Stars */}

        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={15} fill="#D4AF37" color="#D4AF37" />
          ))}
        </div>

        {/* Divider */}

        <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        {/* Button */}

        <Link
          to={buildPath(ROUTES.HOTEL_DETAIL, { id: hotel._id })}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A97718] via-[#D4AF37] to-[#F1D67A] text-[15px] font-semibold text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(212,175,55,.55)]"
          aria-label={`View ${hotel.name}`}
        >
          Explore Hotel
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
});

const FeaturedHotels = ({ hotels = [], loading = false, error = null }) => {
  // Featured hotels come from Home via useQuery(["featured-hotels", 8]) so the
  // request is shared/deduplicated. The API returns { success, data }. Unwrap
  // the array; failures surface a real empty/error state instead of being
  // silently swapped for placeholder data.
  const hotelList = useMemo(() => {
    const live = Array.isArray(hotels) ? hotels : hotels?.data;
    return live && live.length > 0 ? live : [];
  }, [hotels]);

  return (
    <Section className="relative overflow-hidden bg-[#050505] py-2 lg:py-2">
      {/* Gold Glow */}

      <div className="absolute left-[-220px] top-[-220px] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/12 blur-[160px]" />

      <div className="absolute right-[-180px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[160px]" />

      <Container>
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-[#D4AF37]/40 bg-[#111111] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37] shadow-lg">
            Luxury Collection
          </span>

          <h2 className="mt-6 font-serif text-4xl text-gold-500 font-semibold  md:text-5xl">
            Featured Hotels
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
            Handpicked destinations offering timeless luxury, impeccable
            hospitality and unforgettable stays.
          </p>
        </motion.div>

        {/* Swiper */}

        <div className="relative mt-16">
          {/* Left Arrow */}

          <button className="hotel-prev absolute left-[-32px] top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#111111] text-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_30px_rgba(212,175,55,.45)] max-lg:left-[-20px] max-lg:h-12 max-lg:w-12">
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow */}

          <button className="hotel-next absolute right-[-32px] top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#111111] text-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_30px_rgba(212,175,55,.45)] max-lg:right-[-20px] max-lg:h-12 max-lg:w-12">
            <ChevronRight size={20} />
          </button>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[26px] border border-[#2A2A2A] bg-[#111111] p-4"
                >
                  <SkeletonLoader.Card />
                </div>
              ))}
            </div>
          ) : hotelList.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#2C2C2C] bg-[#0F0F0F] px-8 py-10 text-center">
              <p className="font-serif text-xl text-white">
                {error
                  ? "We couldn't load the featured hotels right now."
                  : "Featured hotels are being curated — check back soon."}
              </p>
              {error && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 rounded-xl bg-gradient-to-r from-[#A97718] via-[#D4AF37] to-[#F1D67A] px-6 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.03]"
                >
                  Try again
                </button>
              )}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              loop={false}
              speed={900}
              grabCursor
              navigation={{
                prevEl: ".hotel-prev",
                nextEl: ".hotel-next",
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              spaceBetween={30}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
                1400: {
                  slidesPerView: 4,
                },
              }}
            >
              {hotelList.map((hotel, index) => (
                <SwiperSlide key={hotel._id}>
                  <HotelCard hotel={hotel} priority={index === 0} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeaturedHotels;
