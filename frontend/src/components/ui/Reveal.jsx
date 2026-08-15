import { motion } from "framer-motion";
import { EASE } from "@/theme/animations";

/**
 * Scroll-reveal wrapper. Fades + slides children into view once.
 * Respects reduced-motion via the MotionConfig in main.jsx.
 */
const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

export default Reveal;