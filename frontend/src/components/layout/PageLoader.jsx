import { motion, MotionConfig } from "framer-motion";

/**
 * AureliaStay — Premium Luxury Loader
 *
 * Theme:
 * - Deep black background
 * - Aurelia = white
 * - Stay = gold
 * - Luxury gold orbital animation
 * - Multiple independent rotating rings
 * - Subtle ambient glow
 * - Elegant loading dots
 */

const PageLoader = ({ text = "Preparing your stay" }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#030303]"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {/* Override the app-wide MotionConfig (reducedMotion="user") so the
          gold orbit rings keep rotating continuously regardless of the
          OS reduced-motion preference. */}
      <MotionConfig reducedMotion="never">
        {/* =========================================================
            BACKGROUND
        ========================================================== */}

      {/* Main ambient glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/[0.035] blur-[120px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary moving glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-48 w-48 rounded-full bg-[#D4AF37]/[0.04] blur-[90px]"
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* =========================================================
          SUBTLE BACKGROUND PARTICLES
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {[
          { left: "12%", top: "20%", delay: 0 },
          { left: "82%", top: "18%", delay: 1.2 },
          { left: "20%", top: "72%", delay: 2 },
          { left: "78%", top: "76%", delay: 0.7 },
          { left: "62%", top: "28%", delay: 1.7 },
          { left: "34%", top: "80%", delay: 2.5 },
        ].map((particle, index) => (
          <motion.span
            key={index}
            className="absolute h-[2px] w-[2px] rounded-full bg-[#D4AF37]"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              opacity: [0.1, 0.7, 0.1],
              scale: [0.7, 1.4, 0.7],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <div className="relative z-10 flex flex-col items-center">
        {/* =======================================================
            LOGO / ORBIT SYSTEM
        ======================================================== */}

        <div className="relative flex h-40 w-40 items-center justify-center">
          {/* -------------------------------------------------------
              Outer static guide ring
          -------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-white/[0.045]"
          />

          {/* -------------------------------------------------------
              OUTER ROTATING RING
          -------------------------------------------------------- */}

          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-transparent border-t-[#D4AF37]/60 border-r-[#D4AF37]/10"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              willChange: "transform",
              transformOrigin: "center center",
            }}
          />

          {/* -------------------------------------------------------
              SECOND ROTATING GOLD RING
          -------------------------------------------------------- */}

          <motion.div
            aria-hidden="true"
            className="absolute inset-3 rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#D4AF37]/30"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              willChange: "transform",
              transformOrigin: "center center",
            }}
          />

          {/* -------------------------------------------------------
              THIRD ORBIT
          -------------------------------------------------------- */}

          <motion.div
            aria-hidden="true"
            className="absolute inset-7 rounded-full border border-transparent border-b-[#F5D76E] border-l-[#D4AF37]/30"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              willChange: "transform",
              transformOrigin: "center center",
            }}
          />

          {/* -------------------------------------------------------
              PULSING INNER RING
          -------------------------------------------------------- */}

          <motion.div
            aria-hidden="true"
            className="absolute inset-9 rounded-full border border-[#D4AF37]/30"
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.8, 0.15, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              willChange: "transform, opacity",
            }}
          />

          {/* -------------------------------------------------------
              ROTATING GOLD ARC
          -------------------------------------------------------- */}

          <motion.div
            aria-hidden="true"
            className="absolute inset-1 rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              willChange: "transform",
              transformOrigin: "center center",
            }}
          >
            <div className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F5D76E] shadow-[0_0_10px_rgba(245,215,110,0.9)]" />
          </motion.div>

          {/* -------------------------------------------------------
              CENTER LOGO GLOW
          -------------------------------------------------------- */}

          <motion.div
            aria-hidden="true"
            className="absolute h-24 w-24 rounded-full bg-[#D4AF37]/10 blur-2xl"
            animate={{
              scale: [0.9, 1.2, 0.9],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* -------------------------------------------------------
              CENTER BRAND MARK
          -------------------------------------------------------- */}

          <motion.div
            className="relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#070707]/95 shadow-[0_0_35px_rgba(212,175,55,0.18)] backdrop-blur-xl"
            animate={{
              scale: [1, 1.035, 1],
              boxShadow: [
                "0 0 25px rgba(212,175,55,0.12)",
                "0 0 45px rgba(212,175,55,0.28)",
                "0 0 25px rgba(212,175,55,0.12)",
              ],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              willChange: "transform, box-shadow",
            }}
          >
            {/* Inner border */}
            <div
              aria-hidden="true"
              className="absolute inset-[5px] rounded-full border border-[#D4AF37]/10"
            />

            {/* A */}
            <motion.span
              className="relative font-serif text-[38px] font-medium leading-none text-[#D4AF37]"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              A
            </motion.span>
          </motion.div>
        </div>

        {/* =========================================================
            BRAND NAME
        ========================================================== */}

        <motion.div
          className="mt-8 text-center"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
          }}
        >
          <h1 className="font-serif text-[30px] font-medium tracking-[0.12em]">
            <span className="text-white">Aurelia</span>
            <span className="text-[#D4AF37]">Stay</span>
          </h1>

          {/* Gold divider */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />

            <span className="h-1 w-1 rotate-45 bg-[#D4AF37]" />

            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.5em] text-white/35">
            Luxury Hotels &amp; Residences
          </p>
        </motion.div>

        {/* =========================================================
            LOADING STATUS
        ========================================================== */}

        <motion.div
          className="mt-9 flex items-center gap-3"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.35,
            duration: 0.8,
          }}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/45">
            {text}
          </span>

          {/* Animated dots */}
          <div aria-hidden="true" className="flex items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-[3px] w-[3px] rounded-full bg-[#D4AF37]"
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.7, 1.25, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: dot * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ===========================================================
          TOP / BOTTOM FRAME DETAILS
      ============================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-9 top-9 h-9 w-9 border-l border-t border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-9 top-9 h-9 w-9 border-r border-t border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-9 left-9 h-9 w-9 border-b border-l border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-9 right-9 h-9 w-9 border-b border-r border-white/[0.06]"
      />

      {/* Bottom luxury progress line */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-12 left-1/2 h-px -translate-x-1/2 overflow-hidden bg-white/[0.05]"
        initial={{
          width: 0,
          opacity: 0,
        }}
        animate={{
          width: "180px",
          opacity: 1,
        }}
        transition={{
          duration: 1.2,
          delay: 0.5,
        }}
      >
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          animate={{
            x: ["-100%", "400%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
      </MotionConfig>
    </div>
  );
};

export default PageLoader;
