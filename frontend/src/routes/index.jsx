import { lazy } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { ROUTES, buildPath } from "@/constants/routes";
import PageLoader from "@/components/layout/PageLoader";

// Code-split the Home page; it suspends into the app-level Suspense/PageLoader.
const Home = lazy(() => import("@/pages/Home"));
const Hotels = lazy(() => import("@/pages/Hotels"));
const HotelDetails = lazy(() => import("@/pages/HotelDetails"));
const RoomDetails = lazy(() => import("@/pages/RoomDetails"));
const Booking = lazy(() => import("@/pages/booking/Booking"));
const BookingSuccess = lazy(() => import("@/pages/booking/BookingSuccess"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const AccountOverview = lazy(() => import("@/pages/account/AccountOverview"));
const Profile = lazy(() => import("@/pages/account/Profile"));
const MyBookings = lazy(() => import("@/pages/account/MyBookings"));
const BookingDetail = lazy(() => import("@/pages/account/BookingDetail"));
const Notifications = lazy(() => import("@/pages/account/Notifications"));
const Wishlist = lazy(() => import("@/pages/account/Wishlist"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminHotels = lazy(() => import("@/pages/admin/AdminHotels"));
const AdminRooms = lazy(() => import("@/pages/admin/AdminRooms"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminOffers = lazy(() => import("@/pages/admin/AdminOffers"));
const AdminAmenities = lazy(() => import("@/pages/admin/AdminAmenities"));

// ── Luxury marketing / brand pages ───────────────────────────────
const Experiences = lazy(() => import("@/pages/luxury/Experiences"));
const ExperienceDetail = lazy(() => import("@/pages/luxury/ExperienceDetail"));
const Dining = lazy(() => import("@/pages/luxury/Dining"));
const DiningDetail = lazy(() => import("@/pages/luxury/DiningDetail"));
const About = lazy(() => import("@/pages/luxury/About"));
const Contact = lazy(() => import("@/pages/luxury/Contact"));
const Offers = lazy(() => import("@/pages/luxury/Offers"));
const Destinations = lazy(() => import("@/pages/luxury/Destinations"));
const DestinationDetail = lazy(
  () => import("@/pages/luxury/DestinationDetail"),
);

// ── Collection pages (hotels / experiences / dining menus) ────────────
const BeachResorts = lazy(
  () => import("@/pages/luxury/collections/BeachResorts"),
);
const MountainResorts = lazy(
  () => import("@/pages/luxury/collections/MountainResorts"),
);
const CityHotels = lazy(() => import("@/pages/luxury/collections/CityHotels"));
const PrivateVillas = lazy(
  () => import("@/pages/luxury/collections/PrivateVillas"),
);
const LuxuryResorts = lazy(
  () => import("@/pages/luxury/collections/LuxuryResorts"),
);
const SignatureCollection = lazy(
  () => import("@/pages/luxury/collections/SignatureCollection"),
);
const Rooms = lazy(() => import("@/pages/luxury/collections/Rooms"));
const Suites = lazy(() => import("@/pages/luxury/collections/Suites"));
const PresidentialSuites = lazy(
  () => import("@/pages/luxury/collections/PresidentialSuites"),
);
const FamilyVillas = lazy(
  () => import("@/pages/luxury/collections/FamilyVillas"),
);
const ExperienceSpa = lazy(
  () => import("@/pages/luxury/collections/ExperienceSpa"),
);
const ExperienceWellness = lazy(
  () => import("@/pages/luxury/collections/ExperienceWellness"),
);
const ExperienceYoga = lazy(
  () => import("@/pages/luxury/collections/ExperienceYoga"),
);
const ExperienceAdventure = lazy(
  () => import("@/pages/luxury/collections/ExperienceAdventure"),
);
const ExperiencePrivateDining = lazy(
  () => import("@/pages/luxury/collections/ExperiencePrivateDining"),
);
const ExperienceSafari = lazy(
  () => import("@/pages/luxury/collections/ExperienceSafari"),
);
const ExperienceWine = lazy(
  () => import("@/pages/luxury/collections/ExperienceWine"),
);
const DiningRestaurants = lazy(
  () => import("@/pages/luxury/collections/DiningRestaurants"),
);
const DiningBuffet = lazy(
  () => import("@/pages/luxury/collections/DiningBuffet"),
);
const DiningChefsTable = lazy(
  () => import("@/pages/luxury/collections/DiningChefsTable"),
);
const DiningPrivate = lazy(
  () => import("@/pages/luxury/collections/DiningPrivate"),
);
const DiningBars = lazy(() => import("@/pages/luxury/collections/DiningBars"));
const DiningRooftop = lazy(
  () => import("@/pages/luxury/collections/DiningRooftop"),
);

// ── About family + contact-service pages ─────────────────────────────
const LuxuryPhilosophy = lazy(
  () => import("@/pages/luxury/collections/LuxuryPhilosophy"),
);
const Awards = lazy(() => import("@/pages/luxury/collections/Awards"));
const Sustainability = lazy(
  () => import("@/pages/luxury/collections/Sustainability"),
);
const Press = lazy(() => import("@/pages/luxury/collections/Press"));
const Careers = lazy(() => import("@/pages/luxury/collections/Careers"));
const Reservations = lazy(
  () => import("@/pages/luxury/collections/Reservations"),
);
const CustomerSupport = lazy(
  () => import("@/pages/luxury/collections/CustomerSupport"),
);
const Locations = lazy(() => import("@/pages/luxury/collections/Locations"));
const Weddings = lazy(() => import("@/pages/luxury/collections/Weddings"));
const CorporateEvents = lazy(
  () => import("@/pages/luxury/collections/CorporateEvents"),
);

// ── Utility / legal / payment-outcome pages ──────────────────────
const Faq = lazy(() => import("@/pages/luxury/Faq"));
const PrivacyPolicy = lazy(() => import("@/pages/luxury/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/luxury/Terms"));
const CancellationPolicy = lazy(
  () => import("@/pages/luxury/CancellationPolicy"),
);
const PaymentSuccess = lazy(() => import("@/pages/luxury/PaymentSuccess"));
const PaymentFailed = lazy(() => import("@/pages/luxury/PaymentFailed"));
const NotFound = lazy(() => import("@/pages/luxury/NotFound"));

/**
 * Application route tree — layouts are never nested inside each other.
 *
 *   <Layout>          — public luxury shell (Navbar + Footer)
 *       Public routes + protected booking flow + 404
 *   <AuthLayout>      — standalone auth shell (no public Navbar)
 *   <ProtectedRoute> + <DashboardLayout>  — canonical user dashboard (/account/*)
 *   <AdminRoute>     + <DashboardLayout>  — admin dashboard (/admin/*)
 *
 * Legacy standalone account URLs (/profile, /my-bookings, /wishlist,
 * /notifications) redirect to their canonical /account/* equivalents below.
 *
 * Only the public marketing/brand pages and the booking journey render under
 * <Layout />, so the public Navbar never appears on account or admin pages.
 */
/**
 * Preserve the :id when a legacy or deprecated booking-detail URL redirects
 * to the canonical /account/booking/:id route. Handles both the old standalone
 * /my-bookings/:id and the deprecated plural /account/bookings/:id.
 */
const RedirectToBookingDetail = () => {
  const { id } = useParams();
  return (
    <Navigate to={buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id })} replace />
  );
};

const AppRoutes = () => (
  <Routes>
    {/* ── Public luxury shell — Navbar + Footer ─────────────────── */}
    <Route element={<Layout />}>
      <Route path="/loading" element={<PageLoader />} />
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.HOTELS} element={<Hotels />} />
      <Route path={ROUTES.HOTEL_DETAIL} element={<HotelDetails />} />
      <Route path={ROUTES.ROOM_DETAIL} element={<RoomDetails />} />
      {/* Search-aware CTA flows dispatch the destination into the search slice
          and land on /hotels, which renders the matching results. Legacy
          /search URLs redirect there too instead of a dead placeholder. */}
      <Route
        path={ROUTES.SEARCH}
        element={<Navigate to={ROUTES.HOTELS} replace />}
      />

      {/* Luxury brand / marketing (dark full-bleed pages) */}
      <Route path={ROUTES.EXPERIENCES} element={<Experiences />} />
      <Route path={ROUTES.EXPERIENCE_DETAIL} element={<ExperienceDetail />} />
      <Route path={ROUTES.DINING} element={<Dining />} />
      <Route path={ROUTES.DINING_DETAIL} element={<DiningDetail />} />
      <Route path={ROUTES.OFFERS} element={<Offers />} />
      <Route path={ROUTES.DESTINATIONS} element={<Destinations />} />
      <Route path={ROUTES.DESTINATION_DETAIL} element={<DestinationDetail />} />

      {/* Collection pages — static paths outrank the /:id details routes */}
      <Route path={ROUTES.BEACH_RESORTS} element={<BeachResorts />} />
      <Route path={ROUTES.MOUNTAIN_RESORTS} element={<MountainResorts />} />
      <Route path={ROUTES.CITY_HOTELS} element={<CityHotels />} />
      <Route path={ROUTES.PRIVATE_VILLAS} element={<PrivateVillas />} />
      <Route path={ROUTES.LUXURY_RESORTS} element={<LuxuryResorts />} />
      <Route
        path={ROUTES.SIGNATURE_COLLECTION}
        element={<SignatureCollection />}
      />
      <Route path={ROUTES.ROOMS} element={<Rooms />} />
      <Route path={ROUTES.SUITES} element={<Suites />} />
      <Route
        path={ROUTES.PRESIDENTIAL_SUITES}
        element={<PresidentialSuites />}
      />
      <Route path={ROUTES.FAMILY_VILLAS} element={<FamilyVillas />} />
      <Route path={ROUTES.EXPERIENCE_SPA} element={<ExperienceSpa />} />
      <Route
        path={ROUTES.EXPERIENCE_WELLNESS}
        element={<ExperienceWellness />}
      />
      <Route path={ROUTES.EXPERIENCE_YOGA} element={<ExperienceYoga />} />
      <Route
        path={ROUTES.EXPERIENCE_ADVENTURE}
        element={<ExperienceAdventure />}
      />
      <Route
        path={ROUTES.EXPERIENCE_PRIVATE_DINING}
        element={<ExperiencePrivateDining />}
      />
      <Route path={ROUTES.EXPERIENCE_SAFARI} element={<ExperienceSafari />} />
      <Route path={ROUTES.EXPERIENCE_WINE} element={<ExperienceWine />} />
      <Route path={ROUTES.DINING_RESTAURANTS} element={<DiningRestaurants />} />
      <Route path={ROUTES.DINING_BUFFET} element={<DiningBuffet />} />
      <Route path={ROUTES.DINING_CHEFS_TABLE} element={<DiningChefsTable />} />
      <Route path={ROUTES.DINING_PRIVATE} element={<DiningPrivate />} />
      <Route path={ROUTES.DINING_BARS} element={<DiningBars />} />
      <Route path={ROUTES.DINING_ROOFTOP} element={<DiningRooftop />} />

      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path={ROUTES.LUXURY_PHILOSOPHY} element={<LuxuryPhilosophy />} />
      <Route path={ROUTES.AWARDS} element={<Awards />} />
      <Route path={ROUTES.SUSTAINABILITY} element={<Sustainability />} />
      <Route path={ROUTES.PRESS} element={<Press />} />
      <Route path={ROUTES.CAREERS} element={<Careers />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />
      <Route path={ROUTES.RESERVATIONS} element={<Reservations />} />
      <Route path={ROUTES.CUSTOMER_SUPPORT} element={<CustomerSupport />} />
      <Route path={ROUTES.LOCATIONS} element={<Locations />} />
      <Route path={ROUTES.WEDDINGS} element={<Weddings />} />
      <Route path={ROUTES.CORPORATE_EVENTS} element={<CorporateEvents />} />
      <Route path={ROUTES.FAQ} element={<Faq />} />
      <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
      <Route path={ROUTES.TERMS} element={<Terms />} />
      <Route
        path={ROUTES.CANCELLATION_POLICY}
        element={<CancellationPolicy />}
      />
      <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
      <Route path={ROUTES.PAYMENT_FAILED} element={<PaymentFailed />} />

      {/* Protected booking journey keeps the public shell (Navbar visible). */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.BOOKING} element={<Booking />} />
        <Route path={ROUTES.BOOKING_SUCCESS} element={<BookingSuccess />} />
      </Route>

      {/* Premium 404 catch-all — the luxury dead-end page. */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Route>

    {/* ── Auth — standalone two-panel shell (no public Navbar) ──── */}
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
    </Route>

    {/* ── Legacy standalone account URLs → canonical /account/* ──── */}
    <Route element={<ProtectedRoute />}>
      <Route
        path={ROUTES.PROFILE_PAGE}
        element={<Navigate to={ROUTES.PROFILE} replace />}
      />
      <Route
        path={ROUTES.NOTIFICATIONS_PAGE}
        element={<Navigate to={ROUTES.NOTIFICATIONS} replace />}
      />
      <Route
        path={ROUTES.WISHLIST}
        element={<Navigate to={ROUTES.ACCOUNT_WISHLIST} replace />}
      />
      <Route
        path={ROUTES.MY_BOOKINGS}
        element={<Navigate to={ROUTES.BOOKINGS} replace />}
      />
      <Route
        path={ROUTES.MY_BOOKING_DETAIL}
        element={<RedirectToBookingDetail />}
      />
      {/* Deprecated plural detail URL → canonical singular detail (safe for old
          notification links / browser history). The exact /account/bookings
          list route still wins for the two-segment URL — no conflict. */}
      <Route
        path={ROUTES.LEGACY_BOOKING_DETAIL}
        element={<RedirectToBookingDetail />}
      />
    </Route>

    {/* ── User dashboard — DashboardLayout (no public Navbar) ───── */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path={ROUTES.ACCOUNT} element={<AccountOverview />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={ROUTES.BOOKINGS} element={<MyBookings />} />
        <Route
          path={ROUTES.ACCOUNT_BOOKING_DETAIL}
          element={<BookingDetail />}
        />
        <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
        <Route path={ROUTES.ACCOUNT_WISHLIST} element={<Wishlist />} />
      </Route>
    </Route>

    {/* ── Admin — role-gated DashboardLayout (no public Navbar) ── */}
    <Route element={<AdminRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_HOTELS} element={<AdminHotels />} />
        <Route path={ROUTES.ADMIN_ROOMS} element={<AdminRooms />} />
        <Route path={ROUTES.ADMIN_BOOKINGS} element={<AdminBookings />} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
        <Route path={ROUTES.ADMIN_OFFERS} element={<AdminOffers />} />
        <Route path={ROUTES.ADMIN_AMENITIES} element={<AdminAmenities />} />
        {/* Analytics reuses the admin dashboard (its analytics overview). */}
        <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminDashboard />} />
      </Route>
    </Route>

    <Route
      path={ROUTES.ADMIN}
      element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
    />
  </Routes>
);

export default AppRoutes;
