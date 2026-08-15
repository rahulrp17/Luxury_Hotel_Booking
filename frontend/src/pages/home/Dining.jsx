import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  Container,
  Section,
} from "@/components/layout";

import {
  fadeInUp,
  staggerContainer,
  EASE,
} from "@/theme/animations";

const DINING = [
  {
    id: 1,
    title: "The Royal Table",
    subtitle: "Where Fine Cuisine Meets Luxury",
    hotel: "Aurelia Palace",
    city: "New Delhi",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=80",
    description:
      "Experience handcrafted tasting menus, premium wines, elegant interiors and unforgettable culinary moments created by internationally acclaimed chefs.",
  },
  {
    id: 2,
    title: "Skyline Rooftop",
    subtitle: "Panoramic Rooftop Experience",
    hotel: "Royal Residency",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&q=80",
    description:
      "Enjoy handcrafted cocktails, rooftop sunsets and contemporary fine dining in a sophisticated luxury atmosphere.",
  },
  {
    id: 3,
    title: "Ocean Breeze",
    subtitle: "Sea View Fine Dining",
    hotel: "Aurelia Alpine",
    city: "Goa",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1800&q=80",
    description:
      "Fresh coastal flavors, premium seafood and panoramic ocean views create an unforgettable dining experience.",
  },
  {
    id: 4,
    title: "Chef's Signature",
    subtitle: "Award Winning Cuisine",
    hotel: "Emerald Suites",
    city: "Bengaluru",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1800&q=80",
    description:
      "Discover award-winning culinary creations, curated wine pairings and impeccable hospitality in a luxurious setting.",
  },
];

const Dining = () => {
  return (
    <Section className="relative overflow-hidden bg-[#050505] py-24 lg:py-32">

      {/* Background Glow */}

      <div className="absolute left-[-220px] top-[-220px] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/10 blur-[180px]" />

      <div className="absolute bottom-[-220px] right-[-220px] h-[520px] w-[520px] rounded-full bg-[#D4AF37]/10 blur-[180px]" />

      <Container>

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-20 max-w-5xl text-center"
        >

          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#101010] px-7 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">

            <Sparkles size={14} />

            Signature Dining

          </span>

          <h2 className="mt-8 font-serif text-5xl font-medium leading-tight text-white lg:text-7xl">

            Culinary Moments at{" "}

            <span className="bg-gradient-to-r from-[#C89D3D] via-[#F6D879] to-[#C89D3D] bg-clip-text text-transparent">

              AureliaStay

            </span>

          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-4">

            <span className="h-px w-20 bg-[#D4AF37]/40" />

            <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />

            <span className="h-px w-20 bg-[#D4AF37]/40" />

          </div>

          <p className="mx-auto mt-8 max-w-4xl text-lg leading-9 text-gray-400">

            Michelin-inspired restaurants, rooftop lounges, private chef experiences and unforgettable luxury dining crafted for every guest.

          </p>

        </motion.div>

        <motion.div
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="relative"
        >
          <button className="dining-prev absolute left-0 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#0D0D0D] text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black lg:flex">

            <ChevronLeft size={22} />

          </button>

          <button className="dining-next absolute right-0 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#0D0D0D] text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black lg:flex">

            <ChevronRight size={22} />

          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: ".dining-prev",
              nextEl: ".dining-next",
            }}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            speed={900}
            loop={false}
            grabCursor
            className="overflow-visible"
          >

            {DINING.map((item) => (

              <SwiperSlide key={item.id}>

                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="mx-auto flex max-w-[1320px] hidden lg:flex md:flex overflow-hidden rounded-[34px] border border-[#D4AF37]/20 bg-[#0A0A0A] shadow-[0_35px_80px_rgba(0,0,0,.55)]"
                >
                  <div className="relative w-[55%] overflow-hidden">

                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-[595px] w-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    <div className="absolute left-8 top-8">

                      <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#111111]/90 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37] backdrop-blur-xl">

                        <Sparkles size={13} />

                        Signature Dining

                      </span>

                    </div>

                  </div>

                  <div className="w-px bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-transparent" />

                  <div className="flex w-[42%] flex-col justify-center px-14 py-12">
                    <div className="flex items-center gap-2">

                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill="#D4AF37"
                          color="#D4AF37"
                        />
                      ))}

                    </div>

                    <span className="mt-8 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">

                      Luxury Dining Experience

                    </span>

                    <h3 className="mt-5 font-serif text-[44px] font-semibold leading-[1.15] text-white">

                      {item.title}

                    </h3>

                    <p className="mt-5 text-[19px] leading-8 text-[#D4AF37]">

                      {item.subtitle}

                    </p>

                    <div className="mt-8 flex items-center gap-3">

                      <MapPin
                        size={18}
                        className="text-[#D4AF37]"
                      />

                      <span className="text-[16px] text-gray-300">

                        {item.hotel}, {item.city}

                      </span>

                    </div>

                    <div className="mt-8 h-px w-full bg-[#D4AF37]/20" />

                    <p className="mt-8 text-[15px] leading-8 text-gray-400">

                      {item.description}

                    </p>

                    <button className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-gradient-to-r from-[#C89D3D] via-[#F6D879] to-[#C89D3D] px-8 py-4 text-[15px] font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(212,175,55,.35)]">

                      Explore Dining

                      <ArrowRight size={18} />

                    </button>

                  </div>

                </motion.div>

              </SwiperSlide>
            ))}

          </Swiper>

        </motion.div>

        {/* Mobile Layout (UNCHANGED) */}

        <div className="mt-8 lg:hidden md:hidden ">

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}

            navigation={{
              prevEl: ".dining-prev-mobile",
              nextEl: ".dining-next-mobile",
            }}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            speed={900}
            loop={false}
            grabCursor
            className="overflow-hidden rounded-[28px]"
          >

            {DINING.map((item) => (

              <SwiperSlide key={item.id}>

                <div className="relative overflow-hidden rounded-[28px]">

                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-[520px] w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6">

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#111111]/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">

                      <Sparkles size={12} />

                      Signature Dining

                    </span>

                    <h3 className="mt-5 font-serif text-4xl leading-tight text-white">

                      {item.title}

                    </h3>

                    <p className="mt-3 text-base leading-8 text-gray-300">

                      {item.subtitle}

                    </p>

                    <div className="mt-5 flex items-center gap-2 text-gray-300">

                      <MapPin size={16} className="text-[#D4AF37]" />

                      <span>{item.hotel}, {item.city}</span>

                    </div>

                    <div className="mt-5 flex items-center gap-1">

                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill="#D4AF37"
                          color="#D4AF37"
                        />
                      ))}

                    </div>

                    <button className="mt-7 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#C89D3D] to-[#F6D879] px-7 py-3 font-semibold text-black">

                      Explore Dining

                      <ArrowRight size={18} />

                    </button>

                  </div>

                </div>

              </SwiperSlide>

            ))}

          </Swiper>

          <div className="mt-8  flex items-center justify-center gap-5">

            <button className=" dining-prev-mobile flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#111111] text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black">

              <ChevronLeft size={20} />

            </button>

            <button className="  dining-next-mobile flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#111111] text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black">

              <ChevronRight size={20} />

            </button>

          </div>

        </div>
        <style>

          {`
            .swiper-pagination{
              margin-top:40px;
              position:relative;
              
                
            }
              @media(max-width:768px){
                .swiper-pagination{
                  display:none;
                }
              }
                
            .swiper-pagination-bullet{
              width:12px;
              height:12px;
              background:#555;
              opacity:1;
              transition:all .35s ease;
            }

            .swiper-pagination-bullet-active{
              width:36px;
              border-radius:999px;
              background:#D4AF37;
              box-shadow:0 0 18px rgba(212,175,55,.65);
            }
          `}

        </style>

      </Container>

    </Section>

  );
};

export default Dining;