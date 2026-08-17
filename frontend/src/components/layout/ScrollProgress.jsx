import { motion } from "framer-motion";
import useScrollProgress from "@/hooks/useScrollProgress";

/**
 * Thin gold progress bar fixed to the top of the viewport. Width tracks scroll
 * progress via a spring-smoothed Framer Motion value.
 */
const ScrollProgress = () => {
  const scaleX = useScrollProgress();

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-widget h-0.5 origin-left bg-gold-500"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgress;
