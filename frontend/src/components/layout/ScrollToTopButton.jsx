import { motion, AnimatePresence } from "framer-motion";
import useScrolled from "@/hooks/useScrolled";
import Icon from "@/components/ui/Icons";

/**
 * Floating "back to top" glass button. Appears after `threshold` px of scroll,
 * smoothly scrolls to top, and is keyboard focusable.
 */
const ScrollToTopButton = ({ threshold = 600, className = "" }) => {
  const visible = useScrolled(threshold);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/60 text-brand-800 shadow-lg backdrop-blur-md transition-colors hover:bg-gold-100 hover:text-gold-600 focus-visible:ring-2 focus-visible:ring-gold-400 ${className}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
        >
          <Icon name="chevronDown" size={20} className="rotate-180" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;