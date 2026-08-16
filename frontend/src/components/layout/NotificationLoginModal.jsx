import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Lock, ArrowRight, UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { ROUTES } from "@/constants/routes";
import { fadeInUp, staggerContainer } from "@/theme/animations";

/**
 * Premium black-and-gold login prompt shown in place of the real notification
 * panel whenever a guest clicks the bell icon in the Navbar. Logged-in members
 * never see this — they route straight to the real inbox at /account/notifications.
 */
const NotificationLoginModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const goToLogin = () => {
    onClose();
    navigate(ROUTES.LOGIN, {
      state: { from: { pathname: ROUTES.NOTIFICATIONS } },
    });
  };

  const goToRegister = () => {
    onClose();
    navigate(ROUTES.REGISTER);
  };

  return (
    <Modal open={open} onClose={onClose} title="Notifications" size="md" tone="glass">
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Ambient gold glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[#D4AF37]/20 blur-3xl"
          aria-hidden="true"
        />

        <motion.div
          variants={fadeInUp}
          className="relative flex flex-col items-center px-1 py-4 text-center sm:py-6"
        >
          {/* Locked bell emblem */}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-b from-[#D4AF37]/25 to-[#D4AF37]/5 text-[#F1D477] shadow-[0_0_40px_rgba(212,175,55,0.35)]">
            <Bell size={26} />
            <span
              className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0B0B0B] bg-gradient-to-br from-gold-400 to-gold-600 text-brand-950 shadow-[0_0_14px_rgba(212,175,55,0.9)]"
              aria-hidden="true"
            >
              <Lock size={10} strokeWidth={3} />
            </span>
          </span>

          <h3 className="mt-5 font-serif text-xl font-medium leading-snug text-[#F5F1E8] sm:text-2xl">
            Please login to access your notifications.
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#B8B2A5]">
            Sign in to AureliaStay to view booking updates, exclusive offers and
            timely reminders — all in one private place.
          </p>

          {/* Actions */}
          <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={goToLogin}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b8912c] via-[#d4af37] to-[#e7c977] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#0B0B0B] shadow-[0_14px_44px_rgba(212,175,55,0.35)] transition-all duration-300 hover:shadow-[0_18px_56px_rgba(212,175,55,0.5)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7c977] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B] active:scale-[0.98]"
            >
              Login
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
            <button
              type="button"
              onClick={goToRegister}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#E7C977] backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/10 hover:text-[#F1D477] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7c977] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B] active:scale-[0.98]"
            >
              <UserPlus size={15} />
              Create Account
            </button>
          </div>

          <p className="mt-5 text-xs text-[#77736B]">
            Members get booking updates, personalized offers and more.
          </p>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default NotificationLoginModal;