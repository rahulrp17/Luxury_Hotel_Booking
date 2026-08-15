import { useEffect, useState } from "react";

/**
 * Returns true once the window is scrolled past `threshold` px. Used by the
 * navbar to switch from transparent to glass on scroll.
 */
const useScrolled = (threshold = 40) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
};

export default useScrolled;
