import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icons";
import { scaleIn } from "@/theme/animations";
import { ROUTES } from "@/constants/routes";

/**
 * /payment/failed — calm, actionable payment-failure page. No card data is
 * ever shown; the user is pointed back to retry or to support.
 */
const PaymentFailed = () => (
  <>
    <Seo title="Payment not completed" description="Your payment wasn't completed. You can retry anytime — your booking isn't charged." />

    <section className="relative min-h-screen overflow-hidden bg-black">
      <div className="lux-glow absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent" aria-hidden="true" />

      <Container className="flex min-h-screen items-center py-28 sm:py-32">
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="mx-auto max-w-xl">
          <div className="lux-glass px-6 py-12 text-center sm:px-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-black/40"
              aria-hidden="true"
            >
              <Icon name="info" size={32} className="text-[#F1D477]" />
            </motion.div>
            <h1 className="mt-6 font-serif text-3xl text-[#F8F6F0] sm:text-4xl">Payment not completed</h1>
            <p className="mt-4 text-sm leading-relaxed text-[#A8A8A8]">
              Your payment wasn't completed, but no charge has been made. Your room is held briefly — you can retry
              whenever you're ready, or contact our concierge and we'll help you finish your booking.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to={ROUTES.BOOKINGS} className="lux-btn-gold flex-1">
                Retry my booking
              </Link>
              <Link to={ROUTES.CONTACT} className="lux-btn-ghost flex-1">
                Contact the concierge
              </Link>
            </div>

            <p className="mt-8 text-xs text-[#8a94a0]">
              Having trouble? Call <a href="tel:+910000000000" className="text-[#E7C977] hover:underline">+91 00000 00000</a> — we're here 24/7.
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  </>
);

export default PaymentFailed;