import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, ArrowRight } from "lucide-react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { ROUTES } from "@/constants/routes";
import { EASE, fadeInUp, staggerContainer } from "@/theme/animations";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import useEscapeKey from "@/hooks/useEscapeKey";
import { isImplementedPath } from "@/constants/routes";

const ACCOUNT_LINKS = [
  { label: "Profile", to: ROUTES.PROFILE },
  { label: "My Bookings", to: ROUTES.BOOKINGS },
  { label: "Notifications", to: ROUTES.NOTIFICATIONS },
];

const MOBILE_SECTIONS = [
  {
    title: "Hotels",
    to: ROUTES.HOTELS,
    items: [
      { label: "All Hotels", to: ROUTES.HOTELS },
      { label: "Luxury Resorts", to: ROUTES.LUXURY_RESORTS },
      { label: "Beach Resorts", to: ROUTES.BEACH_RESORTS },
      { label: "Mountain Resorts", to: ROUTES.MOUNTAIN_RESORTS },
      { label: "City Hotels", to: ROUTES.CITY_HOTELS },
      { label: "Private Villas", to: ROUTES.PRIVATE_VILLAS },
      { label: "Rooms", to: ROUTES.ROOMS },
      { label: "Offers", to: ROUTES.OFFERS },
      { label: "Suites", to: ROUTES.SUITES },
      { label: "Presidential Suites", to: ROUTES.PRESIDENTIAL_SUITES },
      { label: "Family Villas", to: ROUTES.FAMILY_VILLAS },
      { label: "Signature Collection", to: ROUTES.SIGNATURE_COLLECTION },
    ],
  },
  {
    title: "Experiences",
    to: ROUTES.EXPERIENCES,
    items: [
      { label: "Experiences", to: ROUTES.EXPERIENCES },
      { label: "Spa", to: ROUTES.EXPERIENCE_SPA },
      { label: "Wellness", to: ROUTES.EXPERIENCE_WELLNESS },
      { label: "Yoga & Meditation", to: ROUTES.EXPERIENCE_YOGA },
      { label: "Adventure", to: ROUTES.EXPERIENCE_ADVENTURE },
      { label: "Private Dining", to: ROUTES.EXPERIENCE_PRIVATE_DINING },
      { label: "Safari", to: ROUTES.EXPERIENCE_SAFARI },
      { label: "Wine Experience", to: ROUTES.EXPERIENCE_WINE },
    ],
  },
  {
    title: "Dining",
    to: ROUTES.DINING,
    items: [
      { label: "Dining", to: ROUTES.DINING },
      { label: "Restaurants", to: ROUTES.DINING_RESTAURANTS },
      { label: "Buffet", to: ROUTES.DINING_BUFFET },
      { label: "Chef's Table", to: ROUTES.DINING_CHEFS_TABLE },
      { label: "Bars & Lounges", to: ROUTES.DINING_BARS },
      { label: "Private Dining", to: ROUTES.DINING_PRIVATE },
      { label: "Rooftop Dining", to: ROUTES.DINING_ROOFTOP },
    ],
  },
  {
    title: "About",
    to: ROUTES.ABOUT,
    items: [
      { label: "About", to: ROUTES.ABOUT },
      { label: "Our Story", to: ROUTES.ABOUT },
      { label: "Luxury Philosophy", to: ROUTES.LUXURY_PHILOSOPHY },
      { label: "Awards", to: ROUTES.AWARDS },
      { label: "Sustainability", to: ROUTES.SUSTAINABILITY },
      { label: "Press", to: ROUTES.PRESS },
      { label: "Careers", to: ROUTES.CAREERS },
    ],
  },
  {
    title: "Contact",
    to: ROUTES.CONTACT,
    items: [
      { label: "Contact", to: ROUTES.CONTACT },
      { label: "Reservations", to: ROUTES.RESERVATIONS },
      { label: "Customer Support", to: ROUTES.CUSTOMER_SUPPORT },
      { label: "Locations", to: ROUTES.LOCATIONS },
      { label: "FAQs", to: ROUTES.FAQ },
      { label: "Wedding Enquiries", to: ROUTES.WEDDINGS },
      { label: "Corporate & Events", to: ROUTES.CORPORATE_EVENTS },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", icon: <FaInstagram size={16} /> },
  { label: "Facebook", icon: <FaFacebookF size={16} /> },
  { label: "LinkedIn", icon: <FaLinkedinIn size={16} /> },
  { label: "X", icon: <FaXTwitter size={16} /> },
];

/**
 * Fullscreen luxury mobile navigation with accordion mega sections.
 */
const FullscreenMobileNav = ({
  open,
  onClose,
  isAuthenticated = false,
  isAdmin = false,
  onLogout = () => {},
}) => {
  const [openSection, setOpenSection] = useState(null);

  useLockBodyScroll(open);
  useEscapeKey(onClose, open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-brand-950 text-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="flex h-20 items-center justify-between px-6">
            <span className="font-serif text-2xl font-semibold">
              Aurelia<span className="text-gold-500">Stay</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-full p-2 text-cream/80 transition-colors hover:text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <X size={26} />
            </button>
          </div>

          <motion.nav
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            className="flex-1 overflow-y-auto px-8 py-4"
            aria-label="Mobile navigation"
          >
            <motion.div variants={fadeInUp}>
              <Link
                to={ROUTES.HOME}
                onClick={onClose}
                className="block py-2 font-serif text-4xl font-medium text-cream transition-colors hover:text-gold-300"
              >
                Home
              </Link>
            </motion.div>

            {MOBILE_SECTIONS.map((section) => {
              const expanded = openSection === section.title;
              return (
                <motion.div key={section.title} variants={fadeInUp} className="border-b border-white/10 py-1">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenSection(expanded ? null : section.title)}
                    className="flex w-full items-center justify-between py-2 font-serif text-4xl font-medium text-cream transition-colors hover:text-gold-300"
                  >
                    {section.title}
                    <ChevronDown
                      size={22}
                      className={`text-gold-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <div className="space-y-3 pb-3 pl-4">
                          {section.items.map((item) =>
                            item.to && isImplementedPath(item.to) ? (
                              <Link
                                key={item.label}
                                to={item.to}
                                onClick={onClose}
                                className="flex items-center gap-2 text-base text-cream/75 transition-colors hover:text-gold-300"
                              >
                                <span className="h-px w-3 bg-gold-500/50" />
                                {item.label}
                              </Link>
                            ) : (
                              <span
                                key={item.label}
                                aria-disabled="true"
                                title="Coming soon"
                                className="flex cursor-not-allowed items-center gap-2 text-base text-cream/40"
                              >
                                <span className="h-px w-3 bg-gold-500/25" />
                                {item.label}
                              </span>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {isAuthenticated && (
              <motion.div variants={fadeInUp} className="border-b border-white/10 py-1">
                <button
                  type="button"
                  aria-expanded={openSection === "__account"}
                  onClick={() => setOpenSection(openSection === "__account" ? null : "__account")}
                  className="flex w-full items-center justify-between py-2 font-serif text-4xl font-medium text-cream transition-colors hover:text-gold-300"
                >
                  Account
                  <ChevronDown
                    size={22}
                    className={`text-gold-400 transition-transform duration-300 ${openSection === "__account" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === "__account" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <div className="space-y-3 pb-3 pl-4">
                        {ACCOUNT_LINKS.map((item) => (
                          <Link
                            key={item.label}
                            to={item.to}
                            onClick={onClose}
                            className="flex items-center gap-2 text-base text-cream/75 transition-colors hover:text-gold-300"
                          >
                            <span className="h-px w-3 bg-gold-500/50" />
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link
                            to={ROUTES.ADMIN_DASHBOARD}
                            onClick={onClose}
                            className="flex items-center gap-2 text-base text-cream/75 transition-colors hover:text-gold-300"
                          >
                            <span className="h-px w-3 bg-gold-500/50" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={onLogout}
                          className="flex items-center gap-2 text-base text-cream/75 transition-colors hover:text-gold-300"
                        >
                          <span className="h-px w-3 bg-gold-500/50" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </motion.nav>

          <div className="border-t border-white/10 p-6">
            {!isAuthenticated && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  onClick={onClose}
                  className="rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 text-center text-sm font-medium text-cream backdrop-blur-md transition-colors hover:border-gold-400 hover:text-gold-300"
                >
                  Sign in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={onClose}
                  className="rounded-full border border-gold-500/60 px-5 py-3 text-center text-sm font-medium text-gold-300 transition-colors hover:bg-gold-500/10"
                >
                  Join
                </Link>
              </div>
            )}
            <Link
              to={ROUTES.HOTELS}
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 px-6 py-4 text-base font-semibold text-brand-950 shadow-[0_12px_40px_-10px_rgba(212,175,55,0.7)]"
            >
              Reserve Your Stay <ArrowRight size={18} />
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-cream/70 transition-colors hover:border-gold-400/50 hover:text-gold-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenMobileNav;
