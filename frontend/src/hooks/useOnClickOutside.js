import { useEffect } from "react";

/**
 * Calls `handler` when a pointer event occurs outside the element referenced by
 * `ref`. Disabled when `active` is false (e.g. a closed menu).
 */
const useOnClickOutside = (ref, handler, active = true) => {
  useEffect(() => {
    if (!active) return undefined;

    const listener = (event) => {
      const el = ref?.current;
      if (!el || el.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, active]);
};

export default useOnClickOutside;
