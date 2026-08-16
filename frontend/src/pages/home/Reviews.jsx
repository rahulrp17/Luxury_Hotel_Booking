import { memo, useRef, useEffect } from "react";
import { motion, animate, useInView } from "framer-motion";
import {
  Star,
  Quote,
  BadgeCheck,
  MapPin,
  BedDouble,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { Container, Section } from "@/components/layout";
import { fadeInUp, staggerContainer, EASE } from "@/theme/animations";

import { initials, formatDate } from "@/utils/formatters";

const PREVIEW_REVIEWS = [
  {
    name: "Emma Johnson",
    country: "United Kingdom",
    stay: "Honeymoon Suite",
    rating: 5.0,
    review:
      "The hospitality exceeded every expectation. The ocean-view suite, infinity pool and fine dining created an unforgettable luxury experience.",
    subRatings: {
      cleanliness: 5,
      service: 5,
      location: 4.9,
      comfort: 5,
    },
    date: "2026-06-18",
    verified: true,
  },

  {
    name: "Daniel Carter",
    country: "Canada",
    stay: "Presidential Suite",
    rating: 5,
    review:
      "Exceptional service from arrival to checkout. Every detail reflected true five-star luxury.",
    subRatings: {
      cleanliness: 5,
      service: 5,
      location: 4.8,
      comfort: 5,
    },
    date: "2026-05-30",
    verified: true,
  },

  {
    name: "Sophia Martinez",
    country: "Spain",
    stay: "Ocean View Villa",
    rating: 4.9,
    review:
      "Beautiful rooms, amazing staff and breathtaking sea views. We loved every moment.",
    subRatings: {
      cleanliness: 4.9,
      service: 5,
      location: 4.9,
      comfort: 5,
    },
    date: "2026-05-12",
    verified: true,
  },

  {
    name: "Michael Chen",
    country: "Singapore",
    stay: "Executive Residence",
    rating: 5,
    review:
      "Professional service, elegant interiors and premium hospitality throughout our business trip.",
    subRatings: {
      cleanliness: 5,
      service: 5,
      location: 5,
      comfort: 5,
    },
    date: "2026-04-27",
    verified: true,
  },
  {
    name: "Olivia Davis",
    country: "Australia",
    stay: "Deluxe Suite",
    rating: 4.9,
    review:
      "The rooms were spacious and well-appointed, and the staff was friendly and helpful.",
    subRatings: {
      cleanliness: 4.9,
      service: 5,
      location: 4.9,
      comfort: 5,
    },
    date: "2026-04-10",
    verified: true,
  },

  {
    name: "James Wilson",
    country: "United States",
    stay: "Presidential Suite",
    rating: 5,
    review:
      "The hospitality exceeded every expectation. The ocean-view suite, infinity pool and fine dining created an unforgettable luxury experience.",
    subRatings: {
      cleanliness: 5,
      service: 5,
      location: 4.9,
      comfort: 5,
    },
    date: "2026-03-22",
    verified: true,
  },
];

const SUB_RATINGS = [
  {
    key: "cleanliness",
    label: "Cleanliness",
  },
  {
    key: "service",
    label: "Service",
  },
  {
    key: "location",
    label: "Location",
  },
  {
    key: "comfort",
    label: "Comfort",
  },
];

const PARTICLES = [
  {
    top: "15%",
    left: "8%",
    size: 4,
    delay: 0,
  },
  {
    top: "78%",
    left: "12%",
    size: 3,
    delay: 0.8,
  },
  {
    top: "25%",
    left: "90%",
    size: 5,
    delay: 1.4,
  },
  {
    top: "85%",
    left: "86%",
    size: 3,
    delay: 0.4,
  },
];

/* -------------------------------------------------------------------------- */
/*                              COUNTER COMPONENT                             */
/* -------------------------------------------------------------------------- */

const Counter = ({ value, decimals = 0, className = "" }) => {
  const ref = useRef(null);

  const inView = useInView(ref, {
    once: false,
    amount: 0.5,
  });

  useEffect(() => {
    if (!inView) return;

    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",

      onUpdate(latest) {
        if (ref.current) {
          ref.current.textContent = latest.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
        }
      },
    });

    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                              RATING STARS                                  */
/* -------------------------------------------------------------------------- */

const RatingStars = ({ rating = 5, size = 14 }) => (
  <div
    className="flex items-center gap-1 text-[#D4AF37]"
    role="img"
    aria-label={`${rating} star rating`}
  >
    {[...Array(5)].map((_, index) => (
      <motion.span
        key={index}
        initial={{
          opacity: 0,
          scale: 0,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: false,
        }}
        transition={{
          delay: index * 0.08,
          duration: 0.3,
          ease: EASE,
        }}
      >
        <Star size={size} fill="currentColor" strokeWidth={0} />
      </motion.span>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                             PREMIUM AVATAR                                 */
/* -------------------------------------------------------------------------- */

const Avatar = ({ name }) => (
  <div className=">  relative>  flex>  h-14>  w-14>  items-center>  justify-center>  rounded-full>  bg-gradient-to-br>  from-[#E9D18A]>  via-[#D4AF37]>  to-[#8A6A1C]>  shadow-[0_12px_35px_rgba(212,175,55,.45)]>  shrink-0>">
    <div className="  flex  h-11  w-11  items-center  justify-center  rounded-full  bg-[#151515]  text-sm  font-semibold  text-[#F6E4A7]">
      {initials(name)}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                            PREMIUM REVIEW CARD                             */
/* -------------------------------------------------------------------------- */

const ReviewCard = memo(({ review }) => {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      transition={{
        duration: 0.45,
        ease: EASE,
      }}
      className="  group  relative  overflow-hidden  rounded-[30px]  border  border-[#D4AF37]/20  bg-gradient-to-b  from-[#1D1B17]  via-[#171512]  to-[#111111]  p-6  mb-2     mt-4  shadow-[0_25px_60px_rgba(0,0,0,.45)]  transition-all  duration-500  hover:border-[#D4AF37]/60  w-full  hover:shadow-[0_30px_70px_rgba(212,175,55,.22)]  h-full"
    >
      {/* Gold Glow */}

      <div className="  absolute  -top-32  right-[-80px]  h-60  w-60  rounded-full  bg-[#D4AF37]/10  blur-[120px]  opacity-0  transition  duration-700  group-hover:opacity-100" />

      {/* Quote */}

      <Quote className="  absolute  right-6  top-6  h-20  w-20  text-[#D4AF37]/8" />

      {/* Rating */}

      <div className="flex items-center justify-between">
        <RatingStars rating={review.rating} size={14} />

        {review.verified && (
          <span className="  inline-flex  items-center  gap-1  rounded-full  border  border-[#D4AF37]/30  bg-[#D4AF37]/10  px-3  py-1  text-[10px]  font-semibold  uppercase  tracking-[0.18em]  text-[#E6C86C]">
            <BadgeCheck size={12} />
            Verified
          </span>
        )}
      </div>

      {/* Review */}

      <blockquote className="  mt-6  text-[14px]  leading-8  text-white/80  min-h-[140px]">
        "{review.review}"
      </blockquote>

      {/* Ratings */}

      <div className="  mt-7  space-y-3  border-t  border-white/10  pt-6">
        {SUB_RATINGS.map((item) => {
          const value = review.subRatings[item.key];

          return (
            <div key={item.key} className="flex items-center gap-3">
              <span className="  w-24  text-[10px]  uppercase  tracking-[0.18em]  text-white/50">
                {item.label}
              </span>

              <div className="  h-1.5  flex-1  overflow-hidden  rounded-full  bg-white/10">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  whileInView={{
                    width: `${value * 20}%`,
                  }}
                  viewport={{
                    once: false,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  className="  h-full  rounded-full  bg-gradient-to-r  from-[#B88A22]  via-[#D4AF37]  to-[#F3DD94]"
                />
              </div>

              <span
                className="
                  text-xs
                  text-white/70
                "
              >
                {value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Guest */}

      <div className="  mt-8  flex  items-center  gap-4">
        <Avatar name={review.name} />

        <div>
          <h4 className="  font-serif  text-xl  text-white">{review.name}</h4>

          <div className="  mt-1  flex  items-center  gap-1  text-sm  text-white/60">
            <MapPin size={13} className="text-[#D4AF37]" />

            {review.country}
          </div>
        </div>
      </div>

      {/* Footer */}

      <div className="  mt-2  border-t  border-white/10  pt-5  space-y-2">
        <div className="  flex  items-center  gap-2  text-sm  text-white/70">
          <BedDouble size={15} className="text-[#D4AF37]" />
          Stayed in
          <span className="text-white">{review.stay}</span>
        </div>

        <div className="  flex  items-center  gap-2  text-xs  text-white/40">
          <Calendar size={13} className="text-[#D4AF37]" />

          {formatDate(review.date)}
        </div>
      </div>
    </motion.article>
  );
});
const Reviews = () => {
  const reviews = PREVIEW_REVIEWS;

  return (
    <Section className="relative overflow-hidden bg-[#0E0E0E] py-24 text-white">
      {/* ================= Background Glow ================= */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-220px] top-[-220px] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />

        <div className="absolute right-[-180px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />

        {PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-[#D4AF37]/40"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.25, 0.9, 0.25],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <Container className="relative z-10">
        {/* ================= Heading ================= */}

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37] backdrop-blur-xl">
            <Sparkles size={14} />
            Guest Experiences
          </span>

          <h2 className="mt-7 font-serif text-4xl font-semibold leading-tight text-white md:text-6xl">
            Loved by
            <span className="text-[#D4AF37]"> Thousands of Guests</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Every stay creates unforgettable memories. Discover why travelers
            from around the world choose AureliaStay for luxury, comfort and
            exceptional hospitality.
          </p>
        </motion.div>

        {/* ================= Overall Rating Card ================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
          }}
          transition={{
            duration: 0.8,
          }}
          className="mx-auto mt-16 max-w-xl"
        >
          <div className="rounded-[34px] border border-[#D4AF37]/20 bg-white/5 p-8 text-center backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,.45)]">
            <div className="flex justify-center">
              <RatingStars rating={4.9} size={16} />
            </div>

            <div className="mt-5 flex items-end justify-center gap-2">
              <Counter
                value={4.9}
                decimals={1}
                className="font-serif text-6xl font-semibold text-[#D4AF37]"
              />

              <span className="mb-2 text-3xl text-white/40">/5</span>
            </div>

            <h3 className="mt-3 font-serif text-2xl text-white">
              Overall Guest Rating
            </h3>

            <p className="mt-3 text-white/60">
              Based on
              <span className="mx-2 font-semibold text-[#D4AF37]">
                <Counter value={1248} />
              </span>
              Verified Reviews
            </p>
          </div>
        </motion.div>

        {/* ================= Slider ================= */}

        <div className="relative mt-20">
          {/* Left Arrow */}

          <button className="reviews-prev text-amber-300 absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300 bg-white/10 backdrop-blur-xl transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black lg:flex">
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow */}

          <button className="reviews-next text-amber-300 absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300 bg-white/10 backdrop-blur-xl transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black lg:flex">
            <ChevronRight size={22} />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            loop={false}
            speed={900}
            grabCursor={true}
            centeredSlides={false}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".reviews-prev",
              nextEl: ".reviews-next",
            }}
            spaceBetween={28}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 4,
              },
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.name}>
                <ReviewCard review={review} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ---------------- Mobile Navigation ---------------- */}

          <div className=" relative  mt-8 flex items-center justify-center gap-3 lg:hidden">
            <button className=" absolute left-27 top-1/2 -translate-y-1/2 reviews-prev-mobile text-amber-300 absolute  flex  h-12  w-12  items-center  justify-center  rounded-full  border  border-amber-300  bg-white/10  backdrop-blur-xl  transition  duration-300  hover:border-[#D4AF37]  hover:bg-[#D4AF37]  hover:text-black">
              <ChevronLeft size={20} />
            </button>

            <button className=" absolute right-27 top-1/2 -translate-y-1/2 reviews-next-mobile text-amber-300 absolute  flex  h-12  w-12  items-center  justify-center  rounded-full  border border-amber-300 bg-white/10  backdrop-blur-xl  transition  duration-300  hover:border-[#D4AF37]  hover:bg-[#D4AF37]  hover:text-black">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* ---------------- Luxury Statistics ---------------- */}

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="  mt-8  grid  grid-cols-2  gap-6  rounded-[34px]  border  border-white/10  bg-white/[0.04]  p-8  backdrop-blur-xl  lg:grid-cols-4"
        >
          <div className="text-center">
            <Counter
              value={1200}
              className="  font-serif  text-4xl  font-semibold  text-[#D4AF37]"
            />

            <p className="mt-2 text-sm text-white/60">Happy Guests</p>
          </div>

          <div className="text-center">
            <Counter
              value={40}
              className="  font-serif  text-4xl  font-semibold  text-[#D4AF37]"
            />

            <p className="mt-2 text-sm text-white/60">Countries</p>
          </div>

          <div className="text-center">
            <Counter
              value={150}
              className="  font-serif  text-4xl  font-semibold  text-[#D4AF37]"
            />

            <p className="mt-2 text-sm text-white/60">Luxury Hotels</p>
          </div>

          <div className="text-center">
            <Counter
              value={99}
              className="  font-serif  text-4xl  font-semibold  text-[#D4AF37]"
            />

            <p className="mt-2 text-sm text-white/60">Satisfaction %</p>
          </div>
        </motion.div>

        {/* ---------------- Footer ---------------- */}

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className=" mt-4 border-t border-white/10 pt-8 text-center"
        >
          <p className=" text-[11px]  uppercase  tracking-[0.35em]  text-white/70">
            Luxury Hospitality • Premium Suites • Fine Dining • Personalized
            Experiences
          </p>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Reviews;
