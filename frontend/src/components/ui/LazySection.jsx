import { useEffect, useRef, useState } from "react";

/**
 * Defers rendering of a below-the-fold section until it approaches the
 * viewport. Keeps a fixed min-height placeholder so the page retains its
 * layout (no CLS) while the real content loads.
 *
 * `rootMargin` makes the swap happen ~1200px before the user sees it, so the
 * lazy chunk + data are usually ready by the time the section scrolls into view.
 */
const LazySection = ({
  children,
  minHeight = 600,
  rootMargin = "1200px",
  className = "",
}) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={show ? undefined : { minHeight }}
      aria-hidden={show ? undefined : true}
    >
      {show ? children : null}
    </div>
  );
};

export default LazySection;
