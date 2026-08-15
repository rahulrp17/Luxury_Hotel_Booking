import { motion } from "framer-motion";

/**
 * Premium AureliaStay full-screen loader.
 * Black + gold luxury theme with glassmorphism, glow, and elegant animations.
 */
const PageLoader = ({ text = "Loading" }) => (
  <div
    className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505]"
    role="status"
    aria-live="polite"
    aria-label={text}
  >
    {/* Ambient gold glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[100px]"
    />

    {/* Secondary glow */}
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute h-40 w-40 rounded-full bg-[#F5D76E]/10 blur-[70px]"
      animate={{
        x: [-80, 80, -80],
        y: [-40, 40, -40],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Loader */}
    <div className="relative flex h-32 w-32 items-center justify-center">
      {/* Outer rotating ring */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-[#D4AF37]/20"
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Gold orbit */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-2 rounded-full border border-transparent border-t-[#D4AF37] border-r-[#D4AF37]/40"
        animate={{ rotate: -360 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Pulsing outer glow */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-5 rounded-full border border-[#D4AF37]/40"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.8, 0.15, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glass brand mark */}
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#0d0d0d]/80 shadow-[0_0_40px_rgba(212,175,55,0.18)] backdrop-blur-xl"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 25px rgba(212,175,55,0.12)",
            "0 0 45px rgba(212,175,55,0.28)",
            "0 0 25px rgba(212,175,55,0.12)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Inner shine */}
        <div
          aria-hidden="true"
          className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5"
        />

        <motion.span
          className="relative font-serif text-4xl font-bold text-[#D4AF37]"
          animate={{
            opacity: [0.75, 1, 0.75],
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

    {/* Brand name */}
    <motion.div
      className="mt-8 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="font-serif text-2xl font-semibold tracking-[0.18em] text-[#F5D76E]">
        AureliaStay
      </h1>

      <p className="mt-2 text-[9px] uppercase tracking-[0.45em] text-[#D4AF37]/60">
        Luxury Hotels &amp; Residences
      </p>
    </motion.div>

    {/* Loading text */}
    <motion.div
      className="mt-8 flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]/70">
        {text}
      </span>

      <motion.span
        className="flex gap-1"
        aria-hidden="true"
      >
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1 w-1 rounded-full bg-[#D4AF37]"
            animate={{
              opacity: [0.25, 1, 0.25],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: dot * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.span>
    </motion.div>

    {/* Bottom luxury line */}
    <motion.div
      aria-hidden="true"
      className="absolute bottom-10 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "180px", opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.4 }}
    />
  </div>
);

export default PageLoader;