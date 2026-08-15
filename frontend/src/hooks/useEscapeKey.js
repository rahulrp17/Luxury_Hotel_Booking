import { useEffect } from "react";

/**
 * Invokes `handler` when the Escape key is pressed while `active`.
 */
const useEscapeKey = (handler, active = true) => {
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") handler();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler, active]);
};

export default useEscapeKey;
