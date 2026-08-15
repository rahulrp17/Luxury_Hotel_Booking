import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { Icon } from "@/components/ui";
import Seo from "@/components/common/Seo";
import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { formatISODate } from "@/utils/dates";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentBooking } from "@/store/slices/bookingSlice";
import { fadeInUp, staggerContainer, scaleIn } from "@/theme/animations";

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-[#8A8A8A]">{label}</span>
    <span className="text-right font-medium text-[#F5F1E8]">{value}</span>
  </div>
);

/**
 * Post-payment confirmation. Reads the confirmed booking from the router state
 * set by the payment handler, falling back to the Redux `current` booking so a
 * refresh of this page still shows a meaningful confirmation.
 */
const BookingSuccess = () => {
  const location = useLocation();
  const stored = useAppSelector(selectCurrentBooking);
  const booking = location.state?.booking || stored?.data || stored;

  const hotel = booking?.hotel || {};
  const room = booking?.room || {};
  const pricing = booking?.pricing || {};

  const checkIn = booking?.checkIn ? formatISODate(booking.checkIn) : "—";
  const checkOut = booking?.checkOut ? formatISODate(booking.checkOut) : "—";

  return (
    <>
      <Seo title="Booking confirmed" description="Your luxury stay is booked. Thank you for choosing AureliaStay." />

      <div className="luxury-bg min-h-screen">
        <Container className="py-16 sm:py-24">
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl"
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-black/50 px-6 py-12 text-center backdrop-blur-xl sm:px-12 gold-glow-strong">
              <div className="lux-glow absolute inset-0" aria-hidden="true" />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent"
                aria-hidden="true"
              />

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-gradient-to-br from-[#F1D477] to-[#B8912C] text-[#0B0B0B] shadow-[0_0_60px_rgba(212,175,55,0.45)]"
                aria-hidden="true"
              >
                <motion.span
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
                >
                  <Icon name="check" size={40} strokeWidth={2.4} />
                </motion.span>
              </motion.div>

              <h1 className="relative mt-8 font-serif text-3xl font-medium leading-tight text-[#F8F6F0] sm:text-4xl">
                {booking ? "Your stay is confirmed" : "Booking confirmed"}
              </h1>
              <p className="relative mt-3 text-sm text-[#A8A8A8]">
                {booking
                  ? `A confirmation has been sent to you. Booking ID ${booking.bookingId || ""}`.trim()
                  : "Thank you for choosing AureliaStay. Your booking details will appear in your account."}
              </p>

              <div className="lux-hairline relative mx-auto mt-8 max-w-xs" />

              <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#F1D477]">
                <Icon name="crown" size={14} />
                AureliaStay · Confirmed
              </div>
            </motion.div>

            {/* Details */}
            {booking ? (
              <motion.div variants={fadeInUp} className="lux-glass mt-8 overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="rounded-xl border border-[#D4AF37]/15 bg-white/[0.02] p-5">
                    <h2 className="font-serif text-xl font-medium text-[#F8F6F0]">
                      {hotel.name || "Hotel stay"}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#A8A8A8]">
                      {room.name || ""}
                      {room.name ? " · " : ""}
                      {[hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ")}
                    </p>

                    <div className="mt-4 divide-y divide-[#D4AF37]/10 border-t border-[#D4AF37]/15">
                      <DetailRow label="Check-in" value={checkIn} />
                      <DetailRow label="Check-out" value={checkOut} />
                      <DetailRow
                        label="Guests"
                        value={`${booking.guests?.adults || 0} adult${booking.guests?.adults !== 1 ? "s" : ""}${booking.guests?.children ? `, ${booking.guests.children} child${booking.guests.children > 1 ? "ren" : ""}` : ""}`}
                      />
                      {booking.bookingId && <DetailRow label="Booking reference" value={booking.bookingId} />}
                      <DetailRow
                        label="Amount paid"
                        value={<span className="font-serif text-lg font-semibold text-[#F1D477]">{formatCurrency(pricing.totalAmount)}</span>}
                      />
                      <DetailRow label="Status" value={<span className="rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B0B0B]">Confirmed</span>} />
                      {booking.paidAt && <DetailRow label="Paid at" value={formatDateTime(booking.paidAt)} />}
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link to={ROUTES.BOOKINGS} className="lux-btn-gold flex-1">
                      View my bookings
                    </Link>
                    <Link to={ROUTES.HOME} className="lux-btn-ghost flex-1">
                      Back to home
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp} className="lux-glass mt-8">
                <div className="px-6 py-12 text-center sm:px-10">
                  <p className="text-sm text-[#A8A8A8]">
                    You can review your upcoming stays anytime from your account.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link to={ROUTES.BOOKINGS} className="lux-btn-gold flex-1">
                      View my bookings
                    </Link>
                    <Link to={ROUTES.HOME} className="lux-btn-ghost flex-1">
                      Back to home
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </Container>
      </div>
    </>
  );
};

export default BookingSuccess;