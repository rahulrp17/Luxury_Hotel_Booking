import { motion } from "framer-motion";

const POSITIONS = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
};

/**
 * Floating action button with a spring scale-in and hover/tap feedback.
 */
const FloatingActionButton = ({
  icon,
  label = "Action",
  onClick,
  position = "bottom-right",
  className = "",
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-brand-950 shadow-lg transition-colors hover:bg-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400 ${POSITIONS[position]} ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.94 }}
  >
    {icon}
  </motion.button>
);

export default FloatingActionButton;