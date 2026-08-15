import { useScroll, useSpring } from "framer-motion";

/**
 * Spring-smoothed scroll progress (0 → 1). Returns a MotionValue suitable for
 * driving the gold scroll-progress bar.
 */
const useScrollProgress = (options) => {
  const { scrollYProgress } = useScroll(options);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return scaleX;
};

export default useScrollProgress;
