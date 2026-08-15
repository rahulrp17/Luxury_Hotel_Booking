import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Calendar, Users, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer, EASE } from "@/theme/animations";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch } from "@/store/hooks";
import { setDestination, setDates, setGuests } from "@/store/slices/searchSlice";
import useMediaQuery from "@/hooks/useMediaQuery";
import Magnetic from "@/components/ui/Magnetic";
import { useRef } from "react";


const HERO_VIDEO = "/assets/hero/hero-video.mp4";
const HERO_POSTER = "/assets/hero/hero-poster.jpg";

const daysOut = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

/** Slow ambient light rays sweeping across the frame. */
const Ray = ({ from, delay = 0, duration = 8 }) => (
  <motion.span
    className="absolute -top-10 h-[130%] w-px bg-gradient-to-b from-transparent via-gold-400/25 to-transparent"
    style={{ left: from }}
    initial={{ opacity: 0, rotate: -12 }}
    animate={{ opacity: [0, 0.7, 0], rotate: 14 }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    aria-hidden="true"
  />
);

/** Luxury animated mouse scroll indicator (desktop only). */
const MouseIndicator = () => (
  <motion.div
    className="hidden items-center gap-3 md:flex"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.4, duration: 0.8 }}
    aria-hidden="true"
  >
    <span className="flex h-9 w-6 flex-col items-center rounded-full border border-gold-400/60 p-1.5">
      <motion.span
        className="h-2 w-1 rounded-full bg-gold-400"
        animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
    <span className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Scroll</span>
  </motion.div>
);

const Field = ({ icon, label, children }) => (
  <label className="flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-white/[0.04] sm:px-4">
    <span className="shrink-0 text-gold-400">{icon}</span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wider text-cream/60">{label}</span>
      {children}
    </span>
  </label>
);

/**
 * Cinematic luxury hero — fullscreen video (poster on mobile), layered gradients,
 * gold ambient glow, light rays, magnetic CTAs and a floating glass booking bar.
 * The booking bar flows in-line on mobile (never overlaps) and floats on desktop.
 */
const Hero = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const prefersReducedMotion = useReducedMotion();
  const showVideo = true

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const [destination, setDestinationValue] = useState("");
  const [checkIn, setCheckIn] = useState(daysOut(1));
  const [checkOut, setCheckOut] = useState(daysOut(3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const onSearch = (event) => {
    event.preventDefault();
    dispatch(setDestination(destination.trim()));
    dispatch(setDates({ checkIn, checkOut }));
    dispatch(setGuests({ adults, children }));
    navigate(ROUTES.HOTELS);
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-brand-950 text-cream">
      {/* Background media */}
      <div className="absolute inset-0">
        {showVideo ? (
          <motion.video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, ease: "linear" }}
            aria-hidden="true"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </motion.video>
        ) : (
          <motion.img
            src={HERO_POSTER}
            alt=""
            className="h-full w-full object-cover"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, ease: "linear" }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Layered overlays */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/85 via-brand-950/35 to-brand-950" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-brand-950 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-brand-950 via-brand-950/70 to-transparent" />
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gold-500/15 blur-[140px] sm:h-[38rem] sm:w-[38rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(11,11,11,0.7)_100%)]" />
      </div>

      {/* Light rays */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Ray from="18%" delay={0} />
        <Ray from="42%" delay={2.2} duration={9} />
        <Ray from="66%" delay={4} duration={7} />
        <Ray from="84%" delay={1.2} />
      </div>

      {/* Content */}
      <div className="container-lux relative z-10 flex flex-1 flex-col items-center justify-center pb-8 pt-23 text-center sm:pt-32 lg:pt-10 lg:pb-24">
        <motion.div
          variants={staggerContainer(0.16)}
          initial="hidden"
          animate="visible"
          className="flex w-full max-w-4xl flex-col items-center"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-5 flex items-center bg-black/60 border border-gold-400/30 rounded-full p-3 gap-2 text-[11px] font-medium uppercase tracking-[0.35em] text-gold-400 sm:text-xs"
          >
            <Sparkles size={14} />  World's Finest Luxury Hotels
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="font-serif text-[2.5rem]  font-medium leading-[1.08] tracking-tight text-cream drop-shadow-[0_3px_24px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl"
          >
            Where every stay
            <span className="block font-serif italic text-gold-300">becomes an experience</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-cream/1000 sm:mt-7 sm:text-lg"
          >
            Hand-picked residences and suites, crafted for the discerning traveller —
            where serenity, privacy and effortless service meet.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex w-full flex-wrap items-center justify-center gap-3 sm:mt-11 sm:gap-4"
          >
            <Magnetic>
              <button
                type="button"
                onClick={() => navigate(ROUTES.HOTELS)}
                className="btn-gold px-6 py-3 text-sm sm:px-7"
              >
                Explore hotels <ArrowRight size={16} />
              </button>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => navigate(ROUTES.HOTELS)}
                className="rounded-full border border-gold-500/40 bg-white/[0.06] px-6 py-3 text-sm font-medium text-cream backdrop-blur-md transition-all duration-300 hover:border-gold-400 hover:text-gold-300 hover:-translate-y-0.5 sm:px-7"
              >
                Book a stay
              </button>
            </Magnetic>
          </motion.div>

          {/* <motion.div variants={fadeInUp} className="mt-12 hidden md:block">
            <MouseIndicator />
          </motion.div> */}
        </motion.div>
      </div>

      {/* Floating / flowing luxury booking bar */}
      <motion.form
        onSubmit={onSearch}
        aria-label="Search availability"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
        className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:absolute lg:bottom-10 lg:left-1/2 lg:w-[96%] lg:-translate-x-1/2 lg:px-0"
      >

        <div className="overflow-hidden rounded-[34px] border border-[#D4AF37]/20 bg-black/65 shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop-blur-3xl">

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">

            {/* Destination */}

            <Field icon={<MapPin size={18} />} label="Destination">

              <select
                value={destination}
                onChange={(e) => setDestinationValue(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm text-cream outline-none"
              >
                <option value="" disabled className="bg-[#111111] text-white">
                  Select Destination
                </option>

                <option value="Manali" className="bg-[#111111] text-white">
                  Manali
                </option>

                <option value="Mumbai" className="bg-[#111111] text-white">
                  Mumbai
                </option>

                <option value="Goa" className="bg-[#111111] text-white">
                  Goa
                </option>

                <option value="Jaipur" className="bg-[#111111] text-white">
                  Jaipur
                </option>

                <option value="Muzaffarpur" className="bg-[#111111] text-white">
                  Muzaffarpur
                </option>

                <option value="Chennai" className="bg-[#111111] text-white">
                  Chennai
                </option>



                <option value="Bengaluru" className="bg-[#111111] text-white">
                  Bengaluru
                </option>

              </select>

            </Field>

            {/* Check In */}

            <Field icon={<Calendar size={18} />} label="Check In">

              <div
                onClick={() => checkInRef.current?.showPicker()}
                className="w-full cursor-pointer"
              >

                <input
                  ref={checkInRef}
                  type="date"
                  value={checkIn}
                  min={daysOut(0)}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm text-cream outline-none [color-scheme:dark]"
                />

              </div>

            </Field>

            {/* Check Out */}

            <Field icon={<Calendar size={18} />} label="Check Out">

              <div
                onClick={() => checkOutRef.current?.showPicker()}
                className="w-full cursor-pointer"
              >

                <input
                  ref={checkOutRef}
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm text-cream outline-none [color-scheme:dark]"
                />

              </div>

            </Field>

            {/* Guests */}

            <Field icon={<Users size={18} />} label="Guests">

              <div className="flex gap-3">

                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="cursor-pointer bg-transparent text-sm text-cream outline-none"
                >

                  {[1, 2, 3, 4, 5, 6,].map((n) => (
                    <option
                      key={n}
                      value={n}
                      className="bg-[#111111] text-white"
                    >
                      {n} Adult
                    </option>
                  ))}

                </select>

                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="cursor-pointer bg-gold text-sm text-cream outline-none"
                >

                  {[0, 1, 2, 3, 4].map((n) => (
                    <option
                      key={n}
                      value={n}
                      className="bg-[#111111] text-white border "
                    >
                      {n} Child
                    </option>
                  ))}

                </select>

              </div>

            </Field>

            {/* Search */}

            <div className="flex items-center justify-center p-5">

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#C8A446] via-[#F6D879] to-[#C8A446] px-8 text-sm font-semibold text-black shadow-[0_15px_45px_rgba(212,175,55,.35)] transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(212,175,55,.55)] lg:w-auto"
              >

                <Search size={18} />

                Search

              </button>

            </div>

          </div>

        </div>

      </motion.form>
    </section>
  );
};

export default Hero;
