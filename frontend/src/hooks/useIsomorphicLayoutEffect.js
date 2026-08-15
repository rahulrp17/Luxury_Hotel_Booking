import { useEffect, useLayoutEffect } from "react";

/**
 * SSR-safe layout effect: uses useLayoutEffect in the browser, falls back to
 * useEffect when window is unavailable.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
