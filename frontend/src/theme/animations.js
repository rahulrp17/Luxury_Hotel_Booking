/**
 * Reusable Framer Motion variants. Keeping them here avoids duplicating motion
 * config across pages and keeps animations consistent.
 */
import { palette } from "@/theme";

/** Standard cubic-bezier ease for a luxurious, slow-reveal feel. */
export const EASE = [0.22, 1, 0.36, 1];

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

/** Parent/child stagger — combine with `staggerChildren`. */
export const staggerContainer = (stagger = 0.12, delay = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/** A subtle gold shimmer used for decorative highlights. */
export const shimmer = {
  background: `linear-gradient(90deg, ${palette.gold[200]}, ${palette.gold[400]}, ${palette.gold[200]})`,
  backgroundSize: "200% 100%",
};

export default Object.freeze({
  EASE,
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  staggerContainer,
  pageTransition,
  shimmer,
});
