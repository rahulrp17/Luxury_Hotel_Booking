import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Icon from "@/components/ui/Icons";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency, formatDate, initials } from "@/utils/formatters";
import { formatISODate } from "@/utils/dates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, selectProfile } from "@/store/slices/userSlice";
import {
  fetchMyBookings,
  selectBookings,
  selectBookingStatus,
  selectBookingPagination,
} from "@/store/slices/bookingSlice";
import { fetchNotifications, selectNotifications } from "@/store/slices/notificationSlice";
import { selectUser } from "@/store/slices/authSlice";
import { useWishlist } from "@/hooks/useWishlist";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const QUICK_ACTIONS = [
  { to: ROUTES.HOTELS, label: "Browse Hotels", icon: "mapPin", desc: "Explore the collection" },
  { to: ROUTES.BOOKINGS, label: "My Bookings", icon: "calendar", desc: "View and manage stays" },
  { to: ROUTES.ACCOUNT_WISHLIST, label: "Wishlist", icon: "heart", desc: "Stays you've saved" },
  { to: ROUTES.PROFILE, label: "Profile", icon: "user", desc: "Details & preferences" },
];

const StatCard = ({ icon, label, value, sub, to }) => (
  <motion.div variants={fadeInUp}>
    <div className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5 backdrop-blur-xl transition-colors hover:border-[#D4AF37]/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[#A8A8A8]">{label}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className="mt-2 font-serif text-3xl font-medium leading-none text-[#F8F6F0]">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-[#A8A8A8]">{sub}</p>}
      {to && (
        <Link to={to} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] transition-colors hover:text-[#F1D477]">
          View <Icon name="chevronRight" size={12} />
        </Link>
      )}
    </div>
  </motion.div>
);

const avatarBlock = (data) => {
  if (data?.avatar?.url) {
    return (
      <img
        src={data.avatar.url}
        alt={data?.name || "Profile"}
        className="h-16 w-16 rounded-full border border-[#D4AF37]/50 object-cover shadow-[0_0_30px_-6px_rgba(212,175,55,0.45)]"
      />
    );
  }
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 font-serif text-xl font-semibold text-[#E7C977]">
      {initials(data?.name)}
    </span>
  );
};

/**
 * Private member landing. Aggregates profile + bookings + unread notifications
 * from the existing slices into a gold-on-black luxury overview with real data.
 */
const AccountOverview = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const bookings = useAppSelector(selectBookings);
  const bookingStatus = useAppSelector(selectBookingStatus);
  const pagination = useAppSelector(selectBookingPagination);
  const notifications = useAppSelector(selectNotifications);
  const wishlist = useWishlist();

  const data = profile || user;

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyBookings({ page: 1, limit: 50 }));
    dispatch(fetchNotifications({ page: 1, limit: 5 }));
  }, [dispatch]);

  const stats = useMemo(() => {
    const upcoming = bookings.filter((b) => ["CONFIRMED", "CHECKED_IN"].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === "CHECKED_OUT").length;
    const unread = notifications.filter((n) => !n.isRead).length;
    return {
      total: pagination?.total ?? bookings.length,
      upcoming,
      completed,
      unread,
    };
  }, [bookings, notifications, pagination]);

  const upcomingStay = useMemo(
    () =>
      bookings
        .filter((b) => ["CONFIRMED", "CHECKED_IN"].includes(b.status))
        .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))[0] || null,
    [bookings]
  );

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);

  const loading = bookingStatus === "loading" && bookings.length === 0;

  return (
    <>
      <Seo title="My account" description="Manage your AureliaStay bookings, profile and notifications." />

      <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="visible" className="-m-4 min-h-[calc(100vh-4rem)] bg-[#050505] px-4 py-8 sm:-m-6 sm:px-6 sm:py-10 lg:-m-8 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
        {/* Welcome hero */}
        <motion.div variants={fadeInUp} className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            {avatarBlock(data)}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Private member</p>
                         <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F8F6F0] sm:text-4xl">
              {(() => {
                const hour = new Date().getHours();
                const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
                const name = data?.name?.split(" ")[0];
                return `Good ${part}, ${name || "Admin"}`;
              })()}
            </h1>
              <p className="mt-1 text-sm text-[#A8A8A8]">
                {data?.email}
                {data?.createdAt ? ` · Member since ${formatDate(data.createdAt)}` : ""}
              </p>
            </div>
          </div>
          {(data?.loyaltyPoints ?? 0) > 0 && (
            <div className="shrink-0 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-4 py-3 text-center backdrop-blur-xl">
              <p className="font-serif text-2xl font-medium text-[#F1D477]">{data.loyaltyPoints}</p>
              <p className="text-xs uppercase tracking-widest text-[#A8A8A8]">Loyalty points</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="calendar" label="Total bookings" value={stats.total} sub={stats.upcoming > 0 ? `${stats.upcoming} upcoming` : "No upcoming stays"} />
          <StatCard icon="star" label="Upcoming stays" value={stats.upcoming} sub={stats.upcoming > 0 ? "Confirmed & checked-in" : "Planning ahead"} />
          <StatCard icon="check" label="Completed stays" value={stats.completed} sub={stats.completed > 0 ? "Past vacations" : "No completed stays"} />
          <StatCard icon="bell" label="Unread updates" value={stats.unread} sub={stats.unread > 0 ? "Tap to review" : "All caught up"} to={ROUTES.NOTIFICATIONS} />
        </div>

        {/* Upcoming stay + quick actions */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.div variants={fadeInUp} className="overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl">
            {loading ? (
              <div className="p-6"><SkeletonLoader.Block className="h-40 w-full" /></div>
            ) : upcomingStay ? (
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full shrink-0 md:w-60">
                  <img
                    src={upcomingStay.hotel?.images?.[0]?.url || ""}
                    alt={upcomingStay.hotel?.name || "Hotel"}
                    loading="lazy"
                    className="h-44 w-full object-cover md:h-full"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(0,0,0,0.5),transparent_70%)]" />
                </div>
                <div className="min-w-0 flex-1 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F1D477]">Upcoming stay</p>
                    <StatusBadge status={upcomingStay.status} />
                  </div>
                  <h2 className="mt-2 truncate font-serif text-2xl font-medium text-[#F8F6F0]">
                    {upcomingStay.hotel?.name || "Hotel stay"}
                  </h2>
                  <p className="mt-1 text-sm text-[#A8A8A8]">
                    {[upcomingStay.hotel?.address?.city, upcomingStay.hotel?.address?.country].filter(Boolean).join(", ") || "AureliaStay"}
                  </p>

                  <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#A8A8A8]">Room</p>
                      <p className="mt-0.5 truncate text-sm text-[#F8F6F0]">{upcomingStay.room?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#A8A8A8]">Guests</p>
                      <p className="mt-0.5 text-sm text-[#F8F6F0]">
                        {upcomingStay.guests?.adults || 0} adult{upcomingStay.guests?.adults === 1 ? "" : "s"}
                        {upcomingStay.guests?.children ? ` · ${upcomingStay.guests.children} child${upcomingStay.guests.children === 1 ? "" : "ren"}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#A8A8A8]">Check-in</p>
                      <p className="mt-0.5 text-sm text-[#F8F6F0]">{formatISODate(upcomingStay.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#A8A8A8]">Check-out</p>
                      <p className="mt-0.5 text-sm text-[#F8F6F0]">{formatISODate(upcomingStay.checkOut)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#D4AF37]/12 pt-4">
                    <span className="text-xs text-[#A8A8A8]">Reference <span className="text-[#E7C977]">{upcomingStay.bookingId}</span></span>
                    <Link
                      to={buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id: upcomingStay._id })}
                      className="inline-flex items-center gap-2 rounded-full border border-[#F8F6F0]/25 px-5 py-2 text-sm font-semibold text-[#F8F6F0] transition-all duration-300 hover:border-[#D4AF37]/70 hover:text-[#F1D477]"
                    >
                      View booking <Icon name="arrowRight" size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                  <Icon name="calendar" size={20} />
                </span>
                <p className="font-serif text-xl text-[#F8F6F0]">No upcoming stays</p>
                <p className="max-w-xs text-sm text-[#A8A8A8]">Your confirmed stays will appear here, ready for the journey.</p>
                <Link to={ROUTES.HOTELS} className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-2.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F1D477]">
                  Browse hotels <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-3">
            {QUICK_ACTIONS.map((item) => (
              <motion.div key={item.to} variants={fadeInUp}>
                <Link
                  to={item.to}
                  className="group flex items-center gap-4 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-4 backdrop-blur-xl transition-colors hover:border-[#D4AF37]/45"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977] transition-colors group-hover:bg-[#D4AF37] group-hover:text-[#0B0B0B]">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#F8F6F0]">{item.label}</span>
                    <span className="block truncate text-xs text-[#A8A8A8]">{item.desc}</span>
                  </span>
                  <Icon name="chevronRight" size={16} className="shrink-0 text-[#A8A8A8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#E7C977]" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <motion.div variants={fadeInUp} className="mt-6 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-medium text-[#F8F6F0]">Recent bookings</h2>
            <Link to={ROUTES.BOOKINGS} className="text-sm font-medium text-[#D4AF37] transition-colors hover:text-[#F1D477]">
              View all
            </Link>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-3"><SkeletonLoader.Block className="h-14 w-full" /><SkeletonLoader.Block className="h-14 w-full" /></div>
            ) : recentBookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D4AF37]/25 py-10 text-center">
                <Icon name="calendar" size={28} className="mx-auto text-[#A8A8A8]" />
                <p className="mt-2 text-sm text-[#A8A8A8]">No bookings yet. Your stays will appear here.</p>
                <Link to={ROUTES.HOTELS} className="mt-4 inline-flex rounded-full bg-[#D4AF37] px-5 py-2 text-sm font-semibold text-[#0B0B0B] transition-colors hover:bg-[#F1D477]">Browse hotels</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/12 text-left text-[#A8A8A8]">
                      <th className="py-2.5 pr-4 font-medium">Hotel</th>
                      <th className="py-2.5 pr-4 font-medium">Dates</th>
                      <th className="py-2.5 pr-4 font-medium">Status</th>
                      <th className="py-2.5 pr-4 text-right font-medium">Amount</th>
                      <th className="py-2.5 font-medium text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/8">
                    {recentBookings.map((booking) => (
                      <tr key={booking._id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <img src={booking.hotel?.images?.[0]?.url || ""} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-[#F8F6F0]">{booking.hotel?.name || "Hotel stay"}</span>
                              <span className="block truncate text-xs text-[#A8A8A8]">{booking.bookingId}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-[#A8A8A8]">
                          <span className="block">{formatISODate(booking.checkIn)}</span>
                          <span className="block text-xs">{formatISODate(booking.checkOut)}</span>
                        </td>
                        <td className="py-3 pr-4"><StatusBadge status={booking.status} /></td>
                        <td className="py-3 pr-4 text-right font-medium text-[#F8F6F0]">{formatCurrency(booking.pricing?.totalAmount)}</td>
                        <td className="py-3 text-right">
                          <Link
                            to={buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id: booking._id })}
                            aria-label={`View booking ${booking.bookingId}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/25 text-[#E7C977] transition-colors hover:bg-[#D4AF37]/15 hover:text-[#F1D477]"
                          >
                            <Icon name="arrowRight" size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Wishlist preview */}
        <motion.div variants={fadeInUp} className="mt-6 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-medium text-[#F8F6F0]">Saved to wishlist</h2>
            {wishlist.count > 0 && (
              <Link to={ROUTES.ACCOUNT_WISHLIST} className="text-sm font-medium text-[#D4AF37] transition-colors hover:text-[#F1D477]">
                View all wishlist
              </Link>
            )}
          </div>

          {wishlist.count === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#D4AF37]/25 py-8 text-center">
              <Icon name="heart" size={26} className="mx-auto text-[#A8A8A8]" />
              <p className="mt-2 text-sm text-[#A8A8A8]">Nothing saved yet — tap the heart on any stay.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {wishlist.items.slice(0, 3).map((item) => {
                const isRoom = Boolean(item.roomType) || Boolean(item.pricePerNight);
                const to = isRoom
                  ? buildPath(ROUTES.ROOM_DETAIL, { id: item._id })
                  : buildPath(ROUTES.HOTEL_DETAIL, { id: item._id });
                const price = item.pricing?.baseAmount ?? item.pricePerNight ?? item.minPrice;
                return (
                  <Link key={item._id} to={to} className="group overflow-hidden rounded-xl border border-[#D4AF37]/15 bg-black/30 transition-colors hover:border-[#D4AF37]/45">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.images?.[0]?.url || ""}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full border border-[#D4AF37]/30 bg-black/60 px-2.5 py-0.5 text-xs font-medium text-[#F1D477] backdrop-blur-md">{isRoom ? "Room" : "Hotel"}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="truncate font-serif text-base font-medium text-[#F8F6F0]">{item.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-[#A8A8A8]">
                        {[item.address?.city, item.address?.country].filter(Boolean).join(", ") || "AureliaStay"}
                      </p>
                      {price > 0 && (
                        <p className="mt-2 text-sm font-medium text-[#F1D477]">
                          {formatCurrency(price)} <span className="text-xs font-normal text-[#A8A8A8]">/ night</span>
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default AccountOverview;