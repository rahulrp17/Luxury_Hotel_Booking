import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { amenityService } from "@/services";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import {
  Container,
  Section,
} from "@/components/layout";

import {
  Reveal,
} from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import {
  fadeInUp,
  staggerContainer,
  EASE,
} from "@/theme/animations";
import { buildResponsiveSrcSet } from "@/utils/helpers";

/* -------------------------------------------------------------------------- */
/*                               DUMMY DATA                                   */
/* -------------------------------------------------------------------------- */

const dummyAmenities = [
  {
    id: 1,
    title: "Free WiFi",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
  },

  {
    id: 2,
    title: "Complimentary Breakfast",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
  },

  {
    id: 3,
    title: "Infinity Swimming Pool",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
  },

  {
    id: 4,
    title: "Luxury Restaurant",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  },

  {
    id: 5,
    title: "Conference Hall",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80",
  },

  {
    id: 6,
    title: "Business Center",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
  },

  {
    id: 7,
    title: "Luxury Spa",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80",
  },

  {
    id: 8,
    title: "Fitness Club",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
  },

  {
    id: 9,
    title: "Airport Pickup",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80",
  },
];

/* -------------------------------------------------------------------------- */
/*                           PREMIUM SKELETON                                 */
/* -------------------------------------------------------------------------- */

const AmenitySkeleton = () => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#D4AF37]/15 bg-[#0E0E0E]">

      <div className="lux-skeleton animate-pulse h-[260px] w-full bg-white/[0.06]" />

      <div className="p-5">

        <div className="lux-skeleton animate-pulse h-6 w-3/4 rounded-lg bg-white/[0.06]" />

      </div>

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           PREMIUM AMENITY CARD                             */
/* -------------------------------------------------------------------------- */

const AmenityCard = ({ amenity }) => {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -12 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="group my-3 relative overflow-hidden rounded-[30px] border border-[#D4AF37]/20 bg-[#0E0E0E] shadow-[0_15px_40px_rgba(0,0,0,.45)] transition-all duration-500 hover:border-[#D4AF37] hover:shadow-[0_0_45px_rgba(212,175,55,.35)]"
    >
      {/* Image */}

      <div className="relative h-[260px] overflow-hidden">

        <img
          src={amenity.image}
          alt={amenity.title}
          srcSet={buildResponsiveSrcSet(amenity.image)}
          sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-transparent transition duration-500 group-hover:from-black" />

        {/* Gold Glow */}

        <div className="absolute inset-0 bg-[#D4AF37]/0 transition duration-500 group-hover:bg-[#D4AF37]/5" />

        {/* Luxury Badge */}

        <span className="absolute left-5 top-5 rounded-full border border-[#D4AF37]/40 bg-black/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37] backdrop-blur-xl">
          Premium
        </span>

        {/* Bottom Card */}

        <div className="absolute bottom-0 left-0 right-0 p-6">

          <div className="rounded-[22px] border border-white/10 bg-black/25 p-5 backdrop-blur-xl transition-all duration-500 group-hover:border-[#D4AF37]/50 group-hover:bg-black/70">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[11px] uppercase font-bold tracking-[0.30em] text-gold-400">
                  Luxury Amenity
                </p>
 
                <h3 className="mt-2 font-serif textlgxl font-semibold text-white">
                  {amenity.title}
                </h3>

              </div>

              <motion.div
                whileHover={{ x: 4 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#C8A446] to-[#E6C86C] text-black shadow-[0_0_25px_rgba(212,175,55,.45)]"
              >
                <ArrowRight size={20} />
              </motion.div>

            </div>

          </div>

        </div>

      </div>

      {/* Animated Gold Border */}

      <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-transparent transition duration-500 group-hover:border-[#D4AF37]" />

    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

const Amenities = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["amenities", 9],
    queryFn: () => amenityService.getAll({ limit: 9 }),
    staleTime: 5 * 60 * 1000,
  });

  // `getAll` resolves to the { success, data, pagination } envelope — unwrap it
  // before checking length (checking `.length` on the envelope was a bug that
  // always fell back to placeholder data). Per-item images still fall back to a
  // luxury photo so a missing image never leaves a blank card; API failures
  // surface a real error state with a retry action.
  const amenities = useMemo(() => {
    const live = Array.isArray(data) ? data : data?.data;
    if (live?.length > 0) {
      return live.map((item, index) => ({
        id: item._id,
        title: item.name,
        image: item.image || dummyAmenities[index % dummyAmenities.length].image,
      }));
    }
    return [];
  }, [data]);

  return (
    <Section className="relative overflow-hidden bg-[#070707] py-20 lg:py-28">

      {/* Background Glow */}

      <div className="absolute left-[-250px] top-[-250px] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/10 blur-[180px]" />

      <div className="absolute right-[-220px] bottom-[-220px] h-[480px] w-[480px] rounded-full bg-[#D4AF37]/10 blur-[170px]" />

      <Container>

        <Reveal>

          <div className="mx-auto mb-16 max-w-3xl text-center">

            <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#121212] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Premium Amenities
            </span>

            <h2 className="mt-6 font-serif text-4xl font-semibold text-gold-500 md:text-5xl">
              Every Luxury Included
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
              Discover exceptional facilities thoughtfully designed to elevate every stay with comfort, elegance and world-class hospitality.
            </p>

          </div>

        </Reveal>

        {isLoading ? (

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map((_, index) => (
              <AmenitySkeleton key={index} />
            ))}

          </div>

        ) : amenities.length === 0 ? (

          <div className="mx-auto max-w-xl rounded-2xl border border-[#2C2C2C] bg-[#0F0F0F] px-8 py-10 text-center">

            <p className="font-serif text-xl text-white">
              {error
                ? "We couldn't load the amenities right now."
                : "Our premium amenities list is being updated."}
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

          <>
            {/* Mobile Navigation */}

            {isMobile && (
              <>
                <button className="amenity-prev border border-amber-300 absolute left-[-3px] top-[72%] z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#141414] text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,.20)] transition hover:bg-[#D4AF37] hover:text-black">
                  <ChevronLeft size={20} />
                </button>

                <button className="amenity-next border border-amber-300 absolute right-[-3px] top-[72%] z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#141414] text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,.20)] transition hover:bg-[#D4AF37] hover:text-black">
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {isMobile ? (

              <Swiper
                modules={[Navigation, Autoplay]}
                navigation={{
                  prevEl: ".amenity-prev",
                  nextEl: ".amenity-next",
                }}
                autoplay={{
                  delay: 2800,
                  disableOnInteraction: false,
                }}
                speed={900}
                loop={false}
                slidesPerView={1}
                spaceBetween={24}
              >
                {amenities.map((amenity) => (
                  <SwiperSlide key={amenity.id}>
                    <AmenityCard amenity={amenity} />
                  </SwiperSlide>
                ))}
              </Swiper>

            ) : (

              <motion.div
                variants={staggerContainer(0.12)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {amenities.map((amenity) => (
                  <AmenityCard
                    key={amenity.id}
                    amenity={amenity}
                  />
                ))}
              </motion.div>

            )}

          </>

        )}

      </Container>

    </Section>
  );
};

export default Amenities;