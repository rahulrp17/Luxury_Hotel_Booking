import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within `ref` while `active`. Focuses the first focusable
 * element on open and loops Tab/Shift+Tab.
 */
const useFocusTrap = (ref, active) => {
  useEffect(() => {
    const container = ref?.current;
    if (!active || !container) return undefined;

    const getFocusables = () =>
      [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
      );

    getFocusables()[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const items = getFocusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [ref, active]);
};

export default useFocusTrap;
