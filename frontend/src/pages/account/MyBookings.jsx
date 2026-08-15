import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Icon from "@/components/ui/Icons";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { ROUTES, buildPath } from "@/constants/routes";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { daysBetween } from "@/utils/dates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMyBookings,
  selectBookings,
  selectBookingStatus,
  selectBookingPagination,
} from "@/store/slices/bookingSlice";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PAGE_SIZE = 6;

const TABS = [
  { key: "", label: "All" },
  { key: "CONFIRMED", label: "Upcoming" },
  { key: "CHECKED_IN", label: "Checked in" },
  { key: "CHECKED_OUT", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

/**
 * My bookings list with server-side status tabs and pagination backed by the
 * booking slice (`fetchMyBookings` → `{ data, pagination }`).
 */
const MyBookings = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const status = useAppSelector(selectBookingStatus);
  const pagination = useAppSelector(selectBookingPagination);

  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyBookings({ page, limit: PAGE_SIZE, status: tab || undefined }));
  }, [dispatch, page, tab]);

  const selectTab = useCallback((key) => {
    setTab(key);
    setPage(1);
  }, []);

  const loading = status === "loading" && bookings.length === 0;
  const error = status === "failed";

  return (
    <div className="lux-canvas">
      <div className="lux-inner">
        <Seo title="My bookings" description="Review and manage your AureliaStay bookings." />

        <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="mx-auto max-w-5xl">
          <motion.div variants={fadeInUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Your stays</p>
            <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">My journeys</h1>
            <p className="mt-1 text-sm text-[#B8B2A5]">Your stays, curated.</p>
          </motion.div>

          {/* Status tabs */}
          <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap gap-2">
            {TABS.map((item) => (
              <button
                key={item.key || "all"}
                type="button"
                onClick={() => selectTab(item.key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  tab === item.key
                    ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#E7C977] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    : "border-white/[0.08] bg-white/[0.02] text-[#B8B2A5] hover:border-[#D4AF37]/35 hover:text-[#F5F1E8]"
                }`}
                aria-pressed={tab === item.key}
              >
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* List */}
          <motion.div variants={fadeInUp} className="mt-6">
            {loading ? (
              <div className="space-y-4">
                <SkeletonLoader.Card tone="dark" />
                <SkeletonLoader.Card tone="dark" />
                <SkeletonLoader.Card tone="dark" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-6 text-center text-sm text-red-200">
                We couldn't load your bookings. Please try again.
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                  <Icon name="calendar" size={24} />
                </span>
                <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">No bookings here yet</p>
                <p className="mt-1 text-sm text-[#B8B2A5]">
                  {tab ? "Try a different filter." : "Find a room you love and secure your stay."}
                </p>
                <Link to={ROUTES.HOTELS} className="lux-btn-gold mt-6 inline-flex">Explore hotels</Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {bookings.map((booking) => {
                  const nights = daysBetween(booking.checkIn, booking.checkOut);
                  const location = [booking.hotel?.address?.city, booking.hotel?.address?.country].filter(Boolean).join(", ");
                  return (
                    <li key={booking._id}>
                      <Link
                        to={buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id: booking._id })}
                        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/45 hover:shadow-[0_24px_70px_rgba(0,0,0,0.5),0_0_30px_rgba(212,175,55,0.14)] sm:flex-row sm:items-center"
                      >
                        <img
                          src={booking.hotel?.images?.[0]?.url || ""}
                          alt={booking.hotel?.name}
                          className="h-36 w-full shrink-0 rounded-xl border border-[#D4AF37]/15 object-cover sm:h-24 sm:w-32"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate font-serif text-xl font-medium text-[#F5F1E8]">
                              {booking.hotel?.name || "Hotel stay"}
                            </h2>
                            <StatusBadge status={booking.status} tone="dark" />
                          </div>
                          <p className="mt-1 truncate text-sm text-[#B8B2A5]">{location || "AureliaStay"}</p>
                          <p className="mt-0.5 text-sm text-[#B8B2A5]">
                            {booking.room?.name || "Room"} · <span className="text-[#E7C977]">{booking.bookingId}</span>
                          </p>
                          <p className="mt-1.5 text-xs text-[#77736B]">
                            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                            {nights > 0 ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""} ·{" "}
                            {booking.guests?.adults} guest{booking.guests?.adults > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <span className="font-serif text-xl font-medium text-[#F1D477]">
                            {formatCurrency(booking.pricing?.totalAmount)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#E7C977]">
                            View booking <Icon name="chevronRight" size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {pagination?.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={setPage}
                tone="dark"
                className="mt-6 flex justify-center"
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookings;