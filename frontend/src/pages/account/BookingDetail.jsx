import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Icon from "@/components/ui/Icons";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { daysBetween, formatISODate } from "@/utils/dates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBookingDetail,
  cancelBooking,
  selectBookingDetail,
  selectBookingStatus,
} from "@/store/slices/bookingSlice";
import { notify } from "@/services";
import { toErrorMessage } from "@/api";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-[#77736B]">{label}</span>
    <span className="text-right font-medium text-[#F5F1E8]">{value}</span>
  </div>
);

const CANCELLABLE = new Set(["PENDING", "CONFIRMED"]);

/**
 * Full booking summary with payment status, guest details and cancellation.
 * Cancel is only offered for PENDING/CONFIRMED and confirms via a modal.
 */
const BookingDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectBookingDetail);
  const status = useAppSelector(selectBookingStatus);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchBookingDetail(id));
  }, [dispatch, id]);

  const loading = status === "loading" && !booking;
  const nights = booking ? daysBetween(booking.checkIn, booking.checkOut) : 0;
  const payment = booking?.payment;
  const cancelled = booking?.status === "CANCELLED" || booking?.status === "REFUNDED";
  // Refund info comes from the fresh cancel response first, then falls back to
  // the payment record's most recent refund (loaded with the booking detail).
  const refundInfo = booking?.refund?.initiated
    ? booking.refund
    : payment?.refunds?.length
      ? payment.refunds[payment.refunds.length - 1]
      : null;

  const onCancel = useCallback(async () => {
    setCancelling(true);
    try {
      const result = await dispatch(cancelBooking({ id, reason: cancelReason.trim() })).unwrap();
      if (result?.refund?.initiated) {
        notify.success("Booking cancelled and refund initiated successfully.");
      } else {
        notify.success("Booking cancelled successfully.");
      }
      setCancelOpen(false);
      setCancelReason("");
    } catch (err) {
      notify.errorFrom(
        err,
        "Booking could not be cancelled because the refund could not be processed. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  }, [dispatch, id, cancelReason]);

  if (loading) {
    return (
      <div className="lux-canvas">
        <div className="lux-inner">
          <div className="mx-auto max-w-4xl space-y-4">
            <Seo title="Booking" description="Booking details." />
            <SkeletonLoader.Card tone="dark" />
            <SkeletonLoader.Card tone="dark" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="lux-canvas">
        <div className="lux-inner">
          <div className="mx-auto max-w-4xl">
            <Seo title="Booking not found" description="Booking details." />
            <div className="rounded-2xl border border-dashed border-[#D4AF37]/25 bg-white/[0.02] py-16 text-center">
              <Icon name="info" size={32} className="mx-auto text-[#C9AB4B]" />
              <p className="mt-3 font-serif text-2xl text-[#F5F1E8]">Booking not found</p>
              <Link to={ROUTES.BOOKINGS} className="lux-btn-gold mt-6 inline-flex">Back to my bookings</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-canvas">
      <div className="lux-inner">
        <Seo title={`Booking ${booking.bookingId || ""}`} description="Your booking details." />

        <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
            <p className="w-full text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Booking reference</p>
            <h1 className="font-serif text-3xl font-medium text-[#F5F1E8] sm:text-4xl">{booking.bookingId || "Booking"}</h1>
            <StatusBadge status={booking.status} tone="dark" />
          </motion.div>
          {booking.createdAt && (
            <p className="mt-1 text-sm text-[#B8B2A5]">Booked {formatDateTime(booking.createdAt)}</p>
          )}

          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              {/* Stay */}
              <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
                <h2 className="font-serif text-xl font-medium text-[#FBF7EA]">Your stay</h2>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  <img
                    src={booking.hotel?.images?.[0]?.url || ""}
                    alt={booking.hotel?.name}
                    className="h-36 w-full shrink-0 rounded-xl border border-[#D4AF37]/15 object-cover sm:h-32 sm:w-48"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-medium text-[#F5F1E8]">{booking.hotel?.name || "Hotel stay"}</p>
                    <p className="text-sm text-[#B8B2A5]">
                      {[booking.hotel?.address?.city, booking.hotel?.address?.country].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-2 text-sm text-[#B8B2A5]">{booking.room?.name || "Room"}</p>
                    <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                      <DetailRow label="Check-in" value={formatISODate(booking.checkIn)} />
                      <DetailRow label="Check-out" value={formatISODate(booking.checkOut)} />
                      <DetailRow label="Nights" value={`${nights} night${nights > 1 ? "s" : ""}`} />
                      <DetailRow
                        label="Guests"
                        value={`${booking.guests?.adults} adult${booking.guests?.adults > 1 ? "s" : ""}${
                          booking.guests?.children ? `, ${booking.guests.children} child${booking.guests.children > 1 ? "ren" : ""}` : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Pricing */}
              <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
                <h2 className="font-serif text-xl font-medium text-[#FBF7EA]">Price summary</h2>
                <div className="mt-3 divide-y divide-[#D4AF37]/10">
                  <DetailRow label={`Subtotal (${nights} night${nights > 1 ? "s" : ""})`} value={formatCurrency(booking.pricing?.baseAmount)} />
                  {(booking.pricing?.addonAmount ?? 0) > 0 && (
                    <DetailRow label="Add-ons" value={formatCurrency(booking.pricing.addonAmount)} />
                  )}
                  {(booking.pricing?.discountAmount ?? 0) > 0 && (
                    <DetailRow label="Discount" value={`− ${formatCurrency(booking.pricing.discountAmount)}`} />
                  )}
                  <DetailRow label="Taxes & fees" value={formatCurrency(booking.pricing?.taxAmount)} />
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-[#B8B2A5]">Total</span>
                    <span className="font-serif text-2xl font-medium text-[#F1D477]">
                      {formatCurrency(booking.pricing?.totalAmount)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Guest details */}
              <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
                <h2 className="font-serif text-xl font-medium text-[#FBF7EA]">Guest details</h2>
                <div className="mt-3">
                  <DetailRow label="Name" value={booking.guestDetails?.name || "—"} />
                  <DetailRow label="Email" value={booking.guestDetails?.email || "—"} />
                  <DetailRow label="Phone" value={booking.guestDetails?.phone || "—"} />
                  {booking.specialRequests && (
                    <DetailRow label="Special requests" value={booking.specialRequests} />
                  )}
                </div>
              </motion.div>
            </div>

            <aside className="space-y-5">
              {/* Payment */}
              <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
                <h2 className="flex items-center gap-2 font-serif text-xl font-medium text-[#FBF7EA]">
                  <Icon name="check" size={16} className="text-[#D4AF37]" /> Payment
                </h2>
                <div className="mt-3">
                  <DetailRow label="Status" value={<StatusBadge status={payment?.status} label={payment?.status ? undefined : "—"} tone="dark" />} />
                  <DetailRow label="Amount" value={formatCurrency(payment?.amount ?? booking.pricing?.totalAmount)} />
                  {payment?.razorpayOrderId && (
                    <DetailRow label="Order ID" value={<span className="break-all font-mono text-xs text-[#E7C977]">{payment.razorpayOrderId}</span>} />
                  )}
                </div>
              </motion.div>

              {/* Cancellation */}
              <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
                <h2 className="font-serif text-xl font-medium text-[#FBF7EA]">Cancellation</h2>
                {cancelled ? (
                  <div className="mt-3 space-y-3 text-sm">
                    {(booking.refundAmount ?? 0) > 0 && (
                      <DetailRow label="Refund" value={formatCurrency(booking.refundAmount)} />
                    )}
                    {refundInfo && (
                      <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3 text-xs">
                        <p className="font-medium text-[#E7C977]">Refund initiated</p>
                        <p className="mt-1 text-[#B8B2A5]">
                          Amount: {formatCurrency(refundInfo.amount)}
                          {refundInfo.refundId ? (
                            <> · ID: <span className="font-mono text-[#E7C977]">{refundInfo.refundId}</span></>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[#B8B2A5]">
                          Status:{" "}
                          <span className="capitalize text-[#E7C977]">
                            {(refundInfo.status || "PROCESSED").toLowerCase()}
                          </span>
                        </p>
                        <p className="mt-2 text-[#77736B]">
                          Gateway refund accepted. The actual credit to your original payment method may take
                          additional time depending on your bank/payment provider.
                        </p>
                      </div>
                    )}
                    {booking.cancellationReason && (
                      <p className="text-[#B8B2A5]">Reason: {booking.cancellationReason}</p>
                    )}
                    {booking.cancellationDate && (
                      <p className="text-xs text-[#77736B]">Cancelled {formatDateTime(booking.cancellationDate)}</p>
                    )}
                  </div>
                ) : CANCELLABLE.has(booking.status) ? (
                  <>
                    <p className="mt-3 text-sm text-[#B8B2A5]">
                      You can cancel this booking. Refunds follow our cancellation policy.
                    </p>
                    <Button
                      type="button"
                      variant="danger"
                      className="mt-4 w-full"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel booking
                    </Button>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-[#B8B2A5]">
                    This booking can no longer be cancelled online.
                  </p>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Link to={ROUTES.BOOKINGS} className="lux-btn-outline w-full">
                  Back to my bookings
                </Link>
              </motion.div>
            </aside>
          </div>
        </motion.div>

        <Modal
          open={cancelOpen}
          onClose={() => setCancelOpen(false)}
          title="Cancel this booking?"
          tone="glass"
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setCancelOpen(false)} disabled={cancelling}>
                Keep booking
              </Button>
              <Button type="button" variant="danger" onClick={onCancel} loading={cancelling}>
                Cancel booking
              </Button>
            </>
          }
        >
          <p className="text-sm text-[#B8B2A5]">
            Cancelling will release your room. Any refund due will be initiated automatically once the
            payment gateway accepts it.
          </p>
          <label htmlFor="cancel-reason" className="lux-label-gold mt-4">Reason (optional)</label>
          <textarea
            id="cancel-reason"
            className="lux-input-solid min-h-20 resize-y"
            placeholder="Tell us why you're cancelling…"
            maxLength={300}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default BookingDetail;