import { motion } from "framer-motion";
import { getFallbackAsset } from "@/constants/assets";
import { fadeIn, fadeInUp } from "@/theme/animations";

/**
 * Cinematic full-bleed dark hero for luxury brand pages: layered imagery,
 * ebony gradient, gold eyebrow, serif title and optional CTAs as children.
 * Fully responsive from 320px; never overflows horizontally.
 */
const LuxuryHero = ({
  eyebrow,
  title,
  description,
  image,
  imageIndex = 0,
  kind = "hero",
  children,
  align = "center",
  height = "min-h-[78vh]",
  className = "",
}) => {
  const src = image || getFallbackAsset(kind, imageIndex);
  const alignWrap =
    align === "left" ? "items-start text-left" : "items-center text-center";
  const ctaWrap = align === "left" ? "" : "justify-center";

  return (
    <section className={`relative bg-black ${className}`}>
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={src}
          alt=""
          loading="eager"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95" />
      </div>

      {/* Top gold hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent"
        aria-hidden="true"
      />

      <div className={`relative z-10 flex ${height} items-center`}>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={`container-lux flex flex-col py-28 ${alignWrap}`}
        >
          {eyebrow && (
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lux-eyebrow mb-5 flex items-center gap-3"
            >
              <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden="true" />
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="max-w-4xl font-serif text-4xl leading-[1.08] text-[#F8F6F0] sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lux-body mt-6 max-w-2xl"
            >
              {description}
            </motion.p>
          )}
          {children && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className={`mt-9 flex flex-wrap items-center gap-4 ${ctaWrap}`}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LuxuryHero;