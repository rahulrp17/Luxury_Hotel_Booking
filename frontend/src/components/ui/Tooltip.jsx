import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/theme/animations";

const POSITIONS = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

/**
 * Lightweight accessible tooltip. Shows on hover and keyboard focus; hidden on
 * leave/blur. Pass a non-interactive trigger element as `children`.
 */
const Tooltip = ({ label, children, position = "top", className = "" }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            role="tooltip"
            className={`pointer-events-none absolute z-50 max-w-52 whitespace-nowrap rounded-md bg-brand-900 px-2 py-1 text-xs font-medium text-cream shadow-lg ${POSITIONS[position]}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;