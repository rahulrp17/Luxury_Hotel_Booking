import { forwardRef } from "react";
import { motion } from "framer-motion";

/**
 * Frosted black/gold glass surface — the signature luxury card.
 * Base styling via the `lux-glass` utility; accepts any layout `className`.
 */
const LuxuryCard = forwardRef(function LuxuryCard(
  { className = "", children, hover = false, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -6 } : undefined}
      className={`lux-glass ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export default LuxuryCard;