import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icons";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentBooking } from "@/store/slices/bookingSlice";
import { scaleIn } from "@/theme/animations";
import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { formatISODate } from "@/utils/dates";

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-[#A8A8A8]">{label}</span>
    <span className="text-right font-medium text-[#F8F6F0]">{value}</span>
  </div>
);

/**
 * /payment/success — luxury post-payment confirmation. Reads the confirmed
 * booking from router state (set by the payment handler), falling back to the
 * Redux `current` booking so a refresh still shows a meaningful confirmation.
 */
const PaymentSuccess = () => {
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
      <Seo title="Payment successful" description="Your payment was successful and your stay is confirmed." />

      <section className="relative min-h-screen overflow-hidden bg-black">
        <div className="lux-glow absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent" aria-hidden="true" />

        <Container className="py-28 sm:py-32">
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="mx-auto max-w-2xl">
            <div className="lux-glass overflow-hidden">
              {/* Header */}
              <div className="bg-black px-6 py-10 text-center sm:px-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B0B0B] shadow-[0_0_50px_rgba(212,175,55,0.6)]"
                  aria-hidden="true"
                >
                  <Icon name="check" size={40} strokeWidth={2.4} />
                </motion.div>
                <h1 className="mt-6 font-serif text-3xl text-[#F8F6F0] sm:text-4xl">
                  {booking ? "Your stay is confirmed" : "Payment successful"}
                </h1>
                <p className="mt-2 text-sm text-[#A8A8A8]">
                  {booking
                    ? `A confirmation has been sent to you. Booking ID ${booking.bookingId || ""}`.trim()
                    : "Thank you for choosing AureliaStay. Your booking details will appear in your account."}
                </p>
              </div>

              {/* Details */}
              {booking ? (
                <div className="px-6 py-6 sm:px-10">
                  <div className="rounded-xl border border-[#D4AF37]/15 bg-black/40 p-5">
                    <h2 className="font-serif text-xl text-[#F8F6F0]">{hotel.name || "Hotel stay"}</h2>
                    <p className="mt-0.5 text-sm text-[#A8A8A8]">
                      {room.name || ""}
                      {room.name ? " · " : ""}
                      {[hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ")}
                    </p>

                    <div className="mt-4 divide-y divide-[#D4AF37]/10 border-t border-[#D4AF37]/10">
                      <DetailRow label="Check-in" value={checkIn} />
                      <DetailRow label="Check-out" value={checkOut} />
                      <DetailRow
                        label="Guests"
                        value={`${booking.guests?.adults || 0} adult${booking.guests?.adults !== 1 ? "s" : ""}${booking.guests?.children ? `, ${booking.guests.children} child${booking.guests.children > 1 ? "ren" : ""}` : ""}`}
                      />
                      {booking.bookingId && <DetailRow label="Booking reference" value={booking.bookingId} />}
                      <DetailRow
                        label="Amount paid"
                        value={<span className="font-serif text-lg text-[#F1D477]">{formatCurrency(pricing.totalAmount)}</span>}
                      />
                      <DetailRow label="Status" value={<span className="lux-chip">Confirmed</span>} />
                      {booking.paidAt && <DetailRow label="Paid at" value={formatDateTime(booking.paidAt)} />}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link to={ROUTES.BOOKINGS} className="lux-btn-gold flex-1">
                      View my bookings
                    </Link>
                    <Link to={ROUTES.HOME} className="lux-btn-ghost flex-1">
                      Back to home
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-10 text-center sm:px-10">
                  <p className="text-sm text-[#A8A8A8]">
                    You can review your upcoming stays anytime from your account.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link to={ROUTES.BOOKINGS} className="lux-btn-gold flex-1">
                      View my bookings
                    </Link>
                    <Link to={ROUTES.HOME} className="lux-btn-ghost flex-1">
                      Back to home
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  );
};

export default PaymentSuccess;