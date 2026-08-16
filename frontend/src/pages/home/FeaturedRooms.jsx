import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { Reveal, SkeletonLoader, Icon } from "@/components/ui";

import { roomService } from "@/services";

import {
  ChevronLeft,
  ChevronRight,
  Users,
  BedDouble,
  Star,
  ArrowRight,
} from "lucide-react";

import { ROUTES, buildPath } from "@/constants/routes";
import { Container, Section, SectionTitle } from "@/components/layout";
import { fadeInUp, EASE } from "@/theme/animations";
import { buildResponsiveSrcSet } from "@/utils/helpers";

/* -------------------------------------------------------------------------- */
/*                                ROOM CARD                                   */
/* -------------------------------------------------------------------------- */
const RatingStars = ({ rating = 0 }) => {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)));

        return (
          <span key={star} className="relative block h-[15px] w-[15px]">
            {/* Empty star */}
            <Star
              size={15}
              strokeWidth={1.8}
              className="absolute inset-0 text-[#5A4A20]"
            />

            {/* Exact rating fill */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                size={15}
                strokeWidth={1.8}
                fill="#D4AF37"
                color="#D4AF37"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
};
const RoomCard = memo(({ room, priority = false }) => {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      transition={{
        duration: 0.35,
        ease: EASE,
      }}
      className="group mx-auto my-10 w-full /*max-w-[320px]*/ overflow-hidden rounded-2xl border border-[#2C2C2C] bg-[#0F0F0F] shadow-[0_15px_40px_rgba(0,0,0,.45)] transition-all duration-500 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,.45)] /*lg:max-w-[275px] md:max-w-[275px]*/"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          srcSet={buildResponsiveSrcSet(room.image)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="h-[190px] w-full /* w-[320px] */ object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Room Type */}
        <span className="absolute left-3 top-3 rounded-full border border-[#D4AF37]/30 bg-black/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.20em] text-[#D4AF37] backdrop-blur-xl">
          {room.type}
        </span>

        {/* Price */}
        <div className="absolute right-3 top-3 rounded-full border border-[#D4AF37]/30 bg-[#121212]/95 px-4 py-2 text-center shadow-lg backdrop-blur-xl">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#B8B8B8]">
            FROM
          </p>

          <p className="text-base font-bold text-[#D4AF37]">{room.price}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-serif text-[22px] font-semibold leading-tight text-white transition duration-300 group-hover:text-[#D4AF37]">
          {room.name}
        </h3>

        {/* Hotel */}
        <p className="mt-1 text-sm text-[#A5A5A5]">{room.hotel}</p>

        {/* Features */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-full border border-[#2F2F2F] bg-[#171717] px-3 py-1.5 text-xs text-[#CFCFCF] transition duration-300 group-hover:border-[#D4AF37]/40">
            <Users size={14} className="text-[#D4AF37]" />
            {room.guests} Guests
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#2F2F2F] bg-[#171717] px-3 py-1.5 text-xs text-[#CFCFCF] transition duration-300 group-hover:border-[#D4AF37]/40">
            <BedDouble size={14} className="text-[#D4AF37]" />
            {room.size} sqft
          </div>
        </div>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-1">
          <RatingStars rating={room.rating} />
          <span className="text-[#CFCFCF] ">({room.rating})</span>
        </div>

        {/* Divider */}
        <div className="my-4 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        {/* Button */}
        <Link
          to={buildPath(ROUTES.ROOM_DETAIL, { id: room._id })}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F2D675] font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(212,175,55,.5)]"
        >
          View Room
          <ArrowRight size={18} />
        </Link>
      </div>
    </motion.article>
  );
});

const FeaturedRooms = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["featured-rooms", 8],
    queryFn: () => roomService.getFeaturedRooms({ limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  // The API returns { success, data, pagination }. Unwrap the array; failures
  // surface a real error/empty state instead of placeholder data.
  const roomList = useMemo(() => {
    const live = Array.isArray(data) ? data : data?.data;
    return live && live.length > 0 ? live : [];
  }, [data]);

  return (
    <Section className="relative overflow-hidden bg-[#050505] mt-[-5rem]">
      <div className="absolute left-[-220px] top-[-220px] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/12 blur-[160px]" />

      <div className="absolute right-[-180px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[160px]" />

      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Luxury Suites"
            title="Featured Rooms & Suites"
            description="Elegant rooms crafted for unforgettable luxury stays."
            align="center"
          />
        </Reveal>

        <div className="relative mt-14">
          {/* Left Arrow */}

          <button className="swiper-room-prev absolute left-[-32px] top-58 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#111111] text-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black max-lg:left-[-20px] max-lg:h-12 max-lg:w-12">
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow */}

          <button className="swiper-room-next absolute right-[-32px] top-58 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#111111] text-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black max-lg:right-[-20px] max-lg:h-12 max-lg:w-12">
            <ChevronRight size={20} />
          </button>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader.Card key={i} />
              ))}
            </div>
          ) : roomList.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#2C2C2C] bg-[#0F0F0F] px-8 py-10 text-center">
              <p className="font-serif text-xl text-white">
                {error
                  ? "We couldn't load the featured rooms right now."
                  : "Our curated suites are being prepared — check back soon."}
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
              navigation={{
                prevEl: ".swiper-room-prev",
                nextEl: ".swiper-room-next",
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={900}
              grabCursor
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
              {roomList.map((room, index) => (
                <SwiperSlide key={room._id}>
                  <RoomCard room={room} priority={index === 0} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeaturedRooms;
