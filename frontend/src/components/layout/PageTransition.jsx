import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { pageTransition } from "@/theme/animations";
import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Route transition wrapper. Keys the animated container by pathname so every
 * navigation replays the fade/scale/blur entrance, and resets scroll to top.
 * Wrap routed content with it.
 */
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();

  useIsomorphicLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <motion.div key={pathname} {...pageTransition}>
      {children}
    </motion.div>
  );
};

export default PageTransition;
