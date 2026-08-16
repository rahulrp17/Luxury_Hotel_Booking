import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Icon from "@/components/ui/Icons";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { formatDate } from "@/utils/formatters";
import { ROUTES, buildPath } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markAllRead,
  markRead,
  removeNotification,
  selectNotifications,
  selectNotificationStatus,
} from "@/store/slices/notificationSlice";
import { notify } from "@/services";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const TYPE_ICON = {
  BOOKING: "calendar",
  PAYMENT: "check",
  OFFER: "star",
  REMINDER: "bell",
  SYSTEM: "info",
};

const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

/**
 * Normalise a notification `link` to a route the router actually owns.
 *
 * Older notification rows carry legacy booking-detail URLs that predate the
 * canonical /account/booking/:id route: /account/bookings/:id from the
 * mid-stage dashboard, or /bookings/:id from before the dashboard existed.
 * Both are re-pointed at the canonical detail page. Query strings are stripped
 * before matching so `/account/bookings/<id>?...` and `/bookings/<id>?...`
 * still resolve. Normal relative links pass through untouched, and a missing
 * link falls back to the structured bookingId metadata when present.
 */
const resolveNotificationLink = (link, data) => {
  if (!link) {
    return data?.bookingId
      ? buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id: data.bookingId })
      : null;
  }

  const path = link.split("?")[0];

  // Legacy plural booking-detail URL → canonical singular detail.
  const pluralBookingMatch = path.match(/^\/account\/bookings\/([^/]+)$/);
  if (pluralBookingMatch) {
    return buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id: pluralBookingMatch[1] });
  }

  // Oldest backend format: /bookings/<bookingId> (pre-account-dashboard).
  const oldBookingMatch = path.match(/^\/bookings\/([^/]+)$/);
  if (oldBookingMatch) {
    return buildPath(ROUTES.ACCOUNT_BOOKING_DETAIL, { id: oldBookingMatch[1] });
  }

  return link.startsWith("/") ? link : null;
};

/**
 * Notification inbox. Unread count is derived client-side (the backend returns
 * paginated notifications without an unreadCount envelope field). Clicking a
 * row marks it read and follows its `link` when it's a relative route.
 */
const Notifications = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector(selectNotifications);
  const status = useAppSelector(selectNotificationStatus);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 30 }));
  }, [dispatch]);

  const unread = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const loading = status === "loading" && notifications.length === 0;

  const onOpen = useCallback(
    (notification) => {
      if (!notification.isRead) {
        dispatch(markRead(notification._id));
      }

      const target = resolveNotificationLink(notification.link, notification.data);
      if (target) {
        navigate(target);
      }
    },
    [dispatch, navigate]
  );

  const onDelete = useCallback(
    async (id) => {
      try {
        await dispatch(removeNotification(id)).unwrap();
        notify.success("Notification deleted.");
      } catch (err) {
        notify.error("Couldn't delete that notification.");
      }
    },
    [dispatch]
  );

  const onMarkAll = useCallback(async () => {
    try {
      await dispatch(markAllRead()).unwrap();
      notify.success("All notifications marked as read.");
    } catch (err) {
      notify.error("Couldn't update your notifications.");
    }
  }, [dispatch]);

  return (
    <div className="lux-canvas">
      <div className="lux-inner">
        <Seo title="Notifications" description="Booking updates and offers from AureliaStay." />

        <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="mx-auto max-w-3xl">
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
              <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Notifications</h1>
              <p className="mt-1 text-sm text-[#B8B2A5]">
                {unread > 0 ? `You have ${unread} unread update${unread > 1 ? "s" : ""}.` : "Booking updates and offers will appear here."}
              </p>
            </div>
            {unread > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={onMarkAll}>
                Mark all as read
              </Button>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-6">
            {loading ? (
              <div className="space-y-3">
                <SkeletonLoader.List count={3} avatar={false} lines={3} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#E7C977]">
                  <Icon name="bell" size={24} />
                </span>
                <p className="mt-4 font-serif text-2xl text-[#F5F1E8]">No notifications yet</p>
                <p className="mt-1 text-sm text-[#B8B2A5]">Booking updates and offers will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notification) => {
                  const icon = TYPE_ICON[notification.type] || "bell";
                  return (
                    <li
                      key={notification._id}
                      className={`flex items-start gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 ${
                        !notification.isRead
                          ? "border-[#D4AF37]/40 bg-white/[0.05] shadow-[0_0_30px_rgba(212,175,55,0.12)]"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-[#D4AF37]/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onOpen(notification)}
                        className="flex min-w-0 flex-1 items-start gap-4 text-left"
                      >
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
                          <Icon name={icon} size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-medium text-[#F5F1E8]">{notification.title}</span>
                            {!notification.isRead && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]" aria-label="Unread" />
                            )}
                          </span>
                          {notification.message && (
                            <span className="mt-0.5 block text-sm text-[#B8B2A5]">{notification.message}</span>
                          )}
                          <span className="mt-1 block text-xs text-[#77736B]">{timeAgo(notification.createdAt)}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Delete notification"
                        onClick={() => onDelete(notification._id)}
                        className="shrink-0 rounded-full p-1.5 text-[#77736B] transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Icon name="close" size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;