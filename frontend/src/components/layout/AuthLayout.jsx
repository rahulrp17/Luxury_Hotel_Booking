import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";
import { fadeInUp, staggerContainer } from "@/theme/animations";
import PageTransition from "./PageTransition";
import Icon from "@/components/ui/Icons";

const PERKS = ["Instant confirmed bookings", "Members-only rates", "No hidden fees"];

/** Spring animation for the Back-to-home pill (Framer Motion hover). */
const MotionLink = motion(Link);

/** Dark glass "← Back to Home" pill shown at the top of the form panel. */
const BackToHome = () => (
  <MotionLink
    to={ROUTES.HOME}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-black/40 px-3 py-1.5 text-xs font-medium text-[#E7C977] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors duration-300 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/10 hover:text-[#F1D477] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60"
    aria-label="Back to home"
  >
    <Icon name="arrowRight" size={13} className="rotate-180" />
    Back to Home
  </MotionLink>
);

/**
 * Auth shell: a moody dark brand panel beside a centred glass form card. The
 * routed form is rendered through <Outlet /> inside a PageTransition.
 * Standalone (no public navbar/footer) so auth screens stay focused.
 */
const AuthLayout = () => (
  <div className="relative grid min-h-screen  overflow-x-hidden bg-[#050505] lg:grid-cols-2">
    {/* Ambient gold glows */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_15%_-5%,rgba(212,175,55,0.14),transparent_70%)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_110%,rgba(212,175,55,0.08),transparent_70%)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"
    />

    {/* Brand panel (desktop) */}
    <div className="relative hidden overflow-hidden border-r border-[#D4AF37]/10 p-12 lg:flex lg:flex-col lg:justify-between">
      <Link to={ROUTES.HOME} className="flex items-baseline gap-1" aria-label="AureliaStay home">
        <span className="font-serif text-2xl font-semibold text-[#F8F6F0]">Aurelia</span>
        <span className="font-serif text-2xl font-semibold text-[#D4AF37]">Stay</span>
      </Link>

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        animate="visible"
        className="max-w-md"
      >
        <motion.span variants={fadeInUp} className="lux-eyebrow mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden="true" />
          Members only
        </motion.span>
        <motion.h1
          variants={fadeInUp}
          className="font-serif text-4xl font-semibold leading-tight text-[#F8F6F0] lg:text-5xl"
        >
          Luxury stays, <br /> made effortless.
        </motion.h1>
        <motion.ul variants={fadeInUp} className="mt-8 space-y-3 text-[#B8B2A5]">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3">
              <Icon name="check" size={16} className="text-[#D4AF37]" />
              {perk}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <p className="text-sm text-[#77736B]">© {new Date().getFullYear()} AureliaStay</p>
    </div>

    {/* Form panel */}
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-6">
      <div className="mb-5 flex w-full max-w-sm items-center justify-between gap-4">
        <BackToHome />
        <Link to={ROUTES.HOME} className="lg:hidden" aria-label="AureliaStay home">
          <span className="font-serif text-2xl font-semibold text-[#F8F6F0]">
            Aurelia<span className="text-[#D4AF37]">Stay</span>
          </span>
        </Link>
      </div>
      <PageTransition>
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </PageTransition>
    </div>
  </div>
);

export default AuthLayout;
