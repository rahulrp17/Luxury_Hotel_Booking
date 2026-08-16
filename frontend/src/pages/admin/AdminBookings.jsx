import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { bookingService, paymentService } from "@/services";
import { notify } from "@/services";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BOOKING_STATUS } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PAGE_SIZE = 10;

const FILTERS = [
  { key: "", label: "All" },  
  { key: BOOKING_STATUS.PENDING, label: "Pending" },
  { key: BOOKING_STATUS.CONFIRMED, label: "Confirmed" },
  { key: BOOKING_STATUS.CHECKED_IN, label: "Checked in" },
  { key: BOOKING_STATUS.CHECKED_OUT, label: "Checked out" },
  { key: BOOKING_STATUS.COMPLETED, label: "Completed" },
  { key: BOOKING_STATUS.CANCELLED, label: "Cancelled" },
  { key: BOOKING_STATUS.REFUNDED, label: "Refunded" },
];

const refundBtnCls =
  "inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-500/60 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Booking administration: filterable table, in-place status updates and manual
 * refunds for bookings that carry a payment record.
 */
const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const query = useQuery({
    queryKey: ["admin", "bookings", page, filter],
    queryFn: () => bookingService.adminGetAll({ page, limit: PAGE_SIZE, status: filter || undefined }),
    staleTime: 60 * 1000,
  });
  const bookings = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
  }, [queryClient]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingService.adminUpdateStatus(id, status),
    onSuccess: () => {
      notify.success("Booking status updated.");
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't update the booking."),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id }) => paymentService.adminRefund(id, {}),
    onSuccess: () => {
      notify.success("Refund initiated.");
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't process the refund."),
  });

  const selectFilter = (key) => {
    setFilter(key);
    setPage(1);
  };

  const loading = query.isLoading && bookings.length === 0;

  return (
    <>
      <Seo title="Manage bookings" description="Review and manage all AureliaStay bookings." />

      <div className="lux-canvas">
        <div className="lux-inner">
          <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Operations</p>
                <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Bookings</h1>
                <p className="mt-1 text-sm text-[#B8B2A5]">Every stay across the platform, from request to refund.</p>
              </div>
              <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1.5 text-xs text-[#E7C977]">
                {pagination?.totalItems ?? bookings.length} booking{pagination?.totalItems === 1 ? "" : "s"}
              </span>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.key || "all"}
                  type="button"
                  onClick={() => selectFilter(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    filter === item.key
                      ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#E7C977] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      : "border-white/[0.08] bg-white/[0.02] text-[#B8B2A5] hover:border-[#D4AF37]/35 hover:text-[#F5F1E8]"
                  }`}
                  aria-pressed={filter === item.key}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
              {loading ? (
                <div className="p-5"><SkeletonLoader.Table columns={9} rows={5} minWidth={1080} /></div>
              ) : bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-serif text-xl text-[#F5F1E8]">No bookings here</p>
                  <p className="mt-1 text-sm text-[#B8B2A5]">{filter ? `No bookings with status ${filter}.` : "Bookings will appear once guests check in."}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px] mx-2 text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
                        <th className="lux-table-th">Reference</th>
                        <th className="lux-table-th">Guest</th>
                        <th className="lux-table-th">Hotel</th>
                        <th className="lux-table-th">Room</th>
                        <th className="lux-table-th">Check-in</th>
                        <th className="lux-table-th">Check-out</th>
                        <th className="lux-table-th">Amount</th>
                        <th className="lux-table-th">Status</th>
                        <th className="lux-table-th text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="lux-table-td">
                            <span className="font-mono text-[#E7C977]">{booking.bookingId}</span>
                          </td>
                          <td className="lux-table-td">
                            <p className="text-[#F5F1E8]">{booking.user?.name || "—"}</p>
                            <p className="text-xs text-[#77736B]">{booking.user?.email || ""}</p>
                          </td>
                          <td className="lux-table-td-sub">{booking.hotel?.name || "—"}</td>
                          <td className="lux-table-td-sub">{booking.room?.name || "—"}</td>
                          <td className="lux-table-td-sub">{formatDate(booking.checkIn)}</td>
                          <td className="lux-table-td-sub">{formatDate(booking.checkOut)}</td>
                          <td className="lux-table-td font-medium text-[#F1D477]">
                            {formatCurrency(booking.pricing?.totalAmount)}
                          </td>
                          <td className="lux-table-td">
                            <StatusBadge status={booking.status} tone="dark" />
                          </td>
                          <td className="lux-table-td">
                            <div className="flex justify-end gap-2">
                              <select
                                value={booking.status}
                                onChange={(e) => statusMutation.mutate({ id: booking._id, status: e.target.value })}
                                disabled={statusMutation.isPending}
                                className="h-8 w-30 cursor-pointer rounded-lg border border-[#D4AF37]/20 bg-[#0E0E0E] px-2 text-xs text-[#F5F1E8] outline-none transition-colors focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/25 disabled:opacity-50"
                                aria-label="Update booking status"
                              >
                                {Object.values(BOOKING_STATUS).map((s) => (
                                  <option key={s} value={s} className="bg-[#0E0E0E]">{s.replace(/_/g, " ").toLowerCase()}</option>
                                ))}
                              </select>
                              {booking.payment && (
                                <button
                                  type="button"
                                  className={refundBtnCls}
                                  onClick={() => refundMutation.mutate({ id: booking.payment })}
                                  disabled={refundMutation.isPending}
                                >
                                  {refundMutation.isPending ? "Refunding…" : "Refund"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination?.totalPages > 1 && (
                <div className="flex justify-center border-t border-[#D4AF37]/15 p-4">
                  <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} tone="dark" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminBookings;