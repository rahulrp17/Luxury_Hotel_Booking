import { useEffect, useState } from "react";

/**
 * Reactive media-query hook. e.g. const isMobile = useMediaQuery("(max-width: 768px)")
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
