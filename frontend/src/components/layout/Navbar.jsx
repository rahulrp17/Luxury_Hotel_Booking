import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Calendar,
  ArrowRight,
  Menu,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, selectIsAuthenticated, selectUser } from "@/store/slices/authSlice";
import { selectUnreadCount } from "@/store/slices/notificationSlice";
import { ROUTES } from "@/constants/routes";
import { USER_ROLES } from "@/constants/enums";
import useScrolled from "@/hooks/useScrolled";
import { EASE } from "@/theme/animations";
import Dropdown from "@/components/ui/Dropdown";
import Magnetic from "@/components/ui/Magnetic";
import MegaMenu from "./MegaMenu";
import SearchModal from "./SearchModal";
import FullscreenMobileNav from "./FullscreenMobileNav";
import NotificationLoginModal from "./NotificationLoginModal";

const HOTELS_MEGA = {
  columns: [
    {
      title: "Collections",
      links: [
        { label: "All Hotels", to: ROUTES.HOTELS },
        { label: "Luxury Resorts", to: ROUTES.LUXURY_RESORTS },
        { label: "Beach Resorts", to: ROUTES.BEACH_RESORTS },
        { label: "Mountain Resorts", to: ROUTES.MOUNTAIN_RESORTS },
        { label: "City Hotels", to: ROUTES.CITY_HOTELS },
        { label: "Private Villas", to: ROUTES.PRIVATE_VILLAS },
        { label: "Offers", to: ROUTES.OFFERS },
      ],
    },
    {
      title: "Stay Types",
      links: [
        { label: "Rooms", to: ROUTES.ROOMS },
        { label: "Suites", to: ROUTES.SUITES },
        { label: "Presidential Suites", to: ROUTES.PRESIDENTIAL_SUITES },
        { label: "Family Villas", to: ROUTES.FAMILY_VILLAS },
        { label: "Signature Collection", to: ROUTES.SIGNATURE_COLLECTION },
      ],
    },
  ],
  featured: {
    image: "/assets/hotels/hotel-01.jpg",
    title: "Signature Resorts",
    description: "An intimate collection of the world's most considered stays.",
    cta: "Explore Collection →",
    to: ROUTES.SIGNATURE_COLLECTION,
  },
  width: "lg",
  align: "center",
};

const EXPERIENCES_MEGA = {
  columns: [
    {
      title: "Experiences",
      links: [
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
  ],
  featured: {
    image: "/assets/rooms/room-01.jpg",
    title: "Curated Journeys",
    description: "Immersive escapes crafted around you.",
    cta: "Discover",
    to: ROUTES.EXPERIENCES,
  },
  width: "md",
  align: "center",
};

const DINING_MEGA = {
  columns: [
    {
      title: "Dining",
      links: [
        { label: "Dining", to: ROUTES.DINING },
        { label: "Restaurants", to: ROUTES.DINING_RESTAURANTS },
        { label: "Buffet", to: ROUTES.DINING_BUFFET },
        { label: "Chef's Table", to: ROUTES.DINING_CHEFS_TABLE },
        { label: "Bars & Lounges", to: ROUTES.DINING_BARS },
        { label: "Private Dining", to: ROUTES.DINING_PRIVATE },
        { label: "Rooftop Dining", to: ROUTES.DINING_ROOFTOP },
      ],
    },
  ],
  featured: {
    image: "/assets/dining/dining-01.jpg",
    title: "A Taste of Luxury",
    description: "World-class cuisine in settings to remember.",
    cta: "Explore Menus",
    to: ROUTES.DINING,
  },
  width: "md",
  align: "center",
};

const ABOUT_MEGA = {
  columns: [
    {
      title: "The Brand",
      links: [
        { label: "About", to: ROUTES.ABOUT },
        { label: "Our Story", to: ROUTES.ABOUT },
        { label: "Luxury Philosophy", to: ROUTES.LUXURY_PHILOSOPHY },
        { label: "Awards", to: ROUTES.AWARDS },
        { label: "Sustainability", to: ROUTES.SUSTAINABILITY },
        { label: "Press", to: ROUTES.PRESS },
        { label: "Careers", to: ROUTES.CAREERS },
      ],
    },
  ],
  featured: {
    image: "/assets/hotels/hotel-02.jpg",
    title: "Our Story",
    description: "The philosophy behind every AureliaStay.",
    cta: "Read the Story",
    to: ROUTES.ABOUT,
  },
  width: "md",
  align: "right",
};

const CONTACT_MEGA = {
  columns: [
    {
      title: "Get in Touch",
      links: [
        { label: "Contact", to: ROUTES.CONTACT },
        { label: "Reservations", to: ROUTES.RESERVATIONS },
        { label: "Customer Support", to: ROUTES.CUSTOMER_SUPPORT },
        { label: "Locations", to: ROUTES.LOCATIONS },
        { label: "FAQs", to: ROUTES.FAQ },
        { label: "Wedding Enquiries", to: ROUTES.WEDDINGS },
        { label: "Corporate & Events", to: ROUTES.CORPORATE_EVENTS },
      ],
    },
  ],
  featured: {
    image: "/assets/hotels/hotel-03.jpg",
    title: "Reservations",
    description: "Our concierge is at your service around the clock.",
    cta: "Contact Us",
    to: ROUTES.RESERVATIONS,
  },
  width: "md",
  align: "right",
};

const navLinkClass = ({ isActive }) =>
  `relative rounded-full px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "text-gold-300" : "text-cream/80 hover:text-gold-300"
  } after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gold-500 after:transition-transform after:duration-300 hover:after:scale-x-100`;

const brandMark = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const scrolled = useScrolled(40);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifLoginOpen, setNotifLoginOpen] = useState(false);

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const handleLogout = async () => {
    await dispatch(logout());
    setMobileOpen(false);
    navigate(ROUTES.HOME);
  };

  const accountLinks = [
    { to: ROUTES.PROFILE, label: "Profile", icon: <User size={16} /> },
    { to: ROUTES.BOOKINGS, label: "My Bookings", icon: <Calendar size={16} /> },
    { to: ROUTES.NOTIFICATIONS, label: "Notifications", icon: <Bell size={16} /> },
  ];

  const glassIcon = "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85 backdrop-blur-md transition-all duration-300 hover:border-gold-400/50 hover:text-gold-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b  border-gold-500/30 bg-brand-950/70 shadow-[0_12px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-[20px]"
            : "bg-gradient-to-b from-brand-950/60 to-transparent"
        }`}
      >
        <nav
          className={`container-lux grid items-center transition-all duration-500 ${
            scrolled ? "h-16" : "h-[90px]"
          } grid-cols-[1fr_auto] gap-4 xl:grid-cols-[260px_minmax(0,1fr)_420px] xl:gap-0`}
        >
          {/* Logo */}
          <motion.span variants={brandMark} initial="hidden" animate="visible" className="justify-self-start">
            <Link to={ROUTES.HOME} className="group flex items-baseline gap-1" aria-label="AureliaStay home">
              <span className="font-serif text-[1.7rem] font-semibold tracking-tight text-cream transition-transform duration-500 group-hover:scale-[1.02]">
                Aurelia
              </span>
              <span className="shimmer-gold font-serif text-[1.7rem] font-semibold transition-transform duration-500 group-hover:scale-[1.02]">
                Stay
              </span>
            </Link>
          </motion.span>

          {/* Centered navigation */}
          <div className="hidden items-center justify-center gap-7 xl:flex">
            <NavLink to={ROUTES.HOME} className={navLinkClass}>
              Home
            </NavLink>
            <MegaMenu label="Hotels" to={ROUTES.HOTELS} {...HOTELS_MEGA} />
            <MegaMenu label="Experiences" to={ROUTES.EXPERIENCES} {...EXPERIENCES_MEGA} />
            <MegaMenu label="Dining" to={ROUTES.DINING} {...DINING_MEGA} />
            <MegaMenu label="About" to={ROUTES.ABOUT} {...ABOUT_MEGA} />
            <MegaMenu label="Contact" to={ROUTES.CONTACT} {...CONTACT_MEGA} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button type="button" aria-label="Search" className={glassIcon} onClick={() => setSearchOpen(true)}>
              <Search size={16} />
            </button>

            <button
              type="button"
              aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
              onClick={() => (isAuthenticated ? navigate(ROUTES.NOTIFICATIONS) : setNotifLoginOpen(true))}
              className={`relative ${glassIcon}`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-brand-950"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            {/* Reserve Stay — gold gradient, magnetic. The hotels list is the first
                step of the booking journey; it never requires auth to browse. */}
            <Magnetic strength={0.3}>
              <Link
                to={ROUTES.HOTELS}
                className="group relative hidden overflow-hidden rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 px-5 py-2 text-sm font-semibold text-brand-950 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] transition-all duration-300 hover:shadow-[0_14px_50px_-8px_rgba(212,175,55,0.85)] lg:inline-flex lg:items-center lg:gap-1.5"
              >
                <span
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />
                Reserve Stay
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>

            {isAuthenticated ? (
              <Dropdown
                 className=" pt-3"
                trigger={
                  user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user?.name || "Account"}
                      className="h-9 w-9 mt-2  rounded-full border border-gold-500/50 object-cover shadow-[0_6px_20px_-6px_rgba(212,175,55,0.7)]"
                    />
                  ) : (
                    <span className="flex h-9 w-9 pt-2 items-center justify-center rounded-full bg-gold-500 text-brand-950 shadow-[0_6px_20px_-6px_rgba(212,175,55,0.7)]">
                      <User size={16} />
                    </span>
                  )
                }
              >
                {({ close }) => (
                  <>
                    {accountLinks.map((link) => (
                      <Dropdown.Item
                        key={link.to}
                        icon={link.icon}
                        onClick={() => {
                          close();
                          navigate(link.to);
                        }}
                      >
                        {link.label}
                      </Dropdown.Item>
                    ))}
                    {isAdmin && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          icon={<LayoutDashboard size={16} />}
                          onClick={() => {
                            close();
                            navigate(ROUTES.ADMIN_DASHBOARD);
                          }}
                        >
                          Admin Dashboard
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item
                      icon={<LogOut size={16} />}
                      onClick={() => {
                        close();
                        handleLogout();
                      }}
                    >
                      Logout
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to={ROUTES.LOGIN}
                  className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cream/90 backdrop-blur-md transition-all duration-300 hover:border-gold-400/50 hover:bg-white/10 hover:text-gold-300"
                >
                  Sign in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="rounded-full border border-gold-500/60 px-4 py-2 text-sm font-medium text-gold-300 transition-all duration-300 hover:bg-gold-500/10 hover:border-gold-400"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="rounded-full p-2 text-cream transition-colors hover:text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400 xl:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationLoginModal
        open={notifLoginOpen}
        onClose={() => setNotifLoginOpen(false)}
      />
      <FullscreenMobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
