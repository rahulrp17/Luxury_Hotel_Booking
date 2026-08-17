import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import { Container } from "@/components/layout";

/**
 * Hotels hero banner with a glass search bar.
 * Clicking anywhere inside the date field opens the native calendar picker.
 */
const HotelsHero = ({ initial = {}, onSearch }) => {
  const [destination, setDestination] = useState(initial.destination || "");
  const [checkIn, setCheckIn] = useState(initial.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial.checkOut || "");
  const [adults, setAdults] = useState(initial.adults || 2);

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const openDatePicker = (inputRef) => {
    const input = inputRef.current;

    if (!input) return;

    // Modern Chrome / Edge / supported browsers
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall back to normal click
      }
    }

    // Fallback for unsupported browsers
    input.focus();
    input.click();
  };

  const submit = (event) => {
    event.preventDefault();

    onSearch({
      destination: destination.trim(),
      checkIn,
      checkOut,
      adults,
    });
  };

  return (
    <section className="relative overflow-hidden bg-brand-950">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold-500/15 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />

      <Container>
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate="visible"
          className="pb-10 pt-26 text-center text-cream sm:pt-20"
        >
          {/* Heading */}
          <motion.p
            variants={fadeInUp}
            className="text-xs uppercase tracking-[0.3em] text-gold-400"
          >
            Hotels &amp; Residences
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mt-3 font-serif text-3xl font-semibold sm:text-5xl"
          >
            Find your perfect stay
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-3 max-w-xl text-sm text-cream/75"
          >
            Search by destination, dates and guests to see live availability
            and best rates.
          </motion.p>

          {/* Search Form */}
          <motion.form
            variants={fadeInUp}
            onSubmit={submit}
            aria-label="Search hotels "
            className="mx-auto mt-8 hidden  lg:grid w-full max-w-4xl gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-left shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr]"
          >
            {/* Destination */}
            <label className="flex cursor-pointer flex-col gap-1 px-2 py-1">
              <span className="text-[11px] uppercase tracking-wider text-cream/70">
                Destination
              </span>

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-sm text-cream outline-none"
              >
                <option
                  value=""
                  disabled
                  className="bg-[#111111] text-white"
                >
                  Select Destination
                </option>

                <option
                  value="Manali"
                  className="bg-[#111111] text-white"
                >
                  Manali
                </option>

                <option
                  value="Mumbai"
                  className="bg-[#111111] text-white"
                >
                  Mumbai
                </option>

                <option
                  value="Goa"
                  className="bg-[#111111] text-white"
                >
                  Goa
                </option>

                <option
                  value="Jaipur"
                  className="bg-[#111111] text-white"
                >
                  Jaipur
                </option>

                <option
                  value="Muzaffarpur"
                  className="bg-[#111111] text-white"
                >
                  Muzaffarpur
                </option>

                <option
                  value="Chennai"
                  className="bg-[#111111] text-white"
                >
                  Chennai
                </option>

                <option
                  value="Bengaluru"
                  className="bg-[#111111] text-white"
                >
                  Bengaluru
                </option>

                <option
                  value="Kolkata"
                  className="bg-[#111111] text-white"
                >
                  Kolkata
                </option>

                <option
                  value="NewDelhi"
                  className="bg-[#111111] text-white"
                >
                  New Delhi
                </option>
              </select>
            </label>

            {/* Check-in */}
            <label
              className="flex cursor-pointer flex-col gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
              onClick={() => openDatePicker(checkInRef)}
            >
              <span className="text-[11px] uppercase tracking-wider text-cream/70">
                Check-in
              </span>

              <input
                ref={checkInRef}
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  openDatePicker(checkInRef);
                }}
                className="w-full cursor-pointer bg-transparent text-sm text-cream focus:outline-none [color-scheme:dark]"
              />
            </label>

            {/* Check-out */}
            <label
              className="flex cursor-pointer flex-col gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
              onClick={() => openDatePicker(checkOutRef)}
            >
              <span className="text-[11px] uppercase tracking-wider text-cream/70">
                Check-out
              </span>

              <input
                ref={checkOutRef}
                type="date"
                value={checkOut}
                min={checkIn || undefined}
                onChange={(e) => setCheckOut(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  openDatePicker(checkOutRef);
                }}
                className="w-full cursor-pointer bg-transparent text-sm text-cream focus:outline-none [color-scheme:dark]"
              />
            </label>

            {/* Guests */}
            <label className="flex flex-col gap-1 px-2 py-1">
              <span className="text-[11px] uppercase tracking-wider text-cream/70">
                Guests
              </span>

              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full cursor-pointer bg-transparent text-sm text-cream focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option
                    key={n}
                    value={n}
                    className="bg-[#111111] text-white"
                  >
                    {n} {n > 1 ? "guests" : "guest"}
                  </option>
                ))}
              </select>
            </label>

            {/* Search */}
            <button
              type="submit"
              className="rounded-xl bg-gold-500 px-6 py-3 text-sm font-semibold text-brand-950 transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
            >
              Search
            </button>
          </motion.form>
        </motion.div>
      </Container>
    </section>
  );
};

export default HotelsHero;