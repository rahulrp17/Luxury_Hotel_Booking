import { useEffect } from "react";

/**
 * Locks body scroll while `locked` is true. Used by Modal/Drawer so the page
 * behind doesn't scroll.
 */
const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
};

export default useLockBodyScroll;
