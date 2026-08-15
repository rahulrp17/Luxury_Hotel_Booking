import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

/**
 * Smooth-scroll provider for the whole app.
 *
 * Uses Lenis (via its React binding) on the window root. Respects
 * prefers-reduced-motion by disabling smooth wheel behaviour, keeping the
 * experience accessible.
 *
 * Usage: wrap the app (above the router) with <LenisProvider>.
 */
const LenisProvider = ({ children, options = {} }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <ReactLenis
      root
      autoRaf
      options={{
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: !prefersReducedMotion,
        touchMultiplier: 1.6,
        ...options,
      }}
    >
      {children}
    </ReactLenis>
  );
};

export default LenisProvider;
