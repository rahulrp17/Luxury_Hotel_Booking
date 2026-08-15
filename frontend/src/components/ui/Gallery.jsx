import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/theme/animations";
import Icon from "./Icons";

/**
 * Reusable crossfading photo gallery with a thumbnail strip. Shared by the
 * hotel and room detail pages so the gallery behavior stays in one place.
 *
 * @param {Array}  images   - [{ url, alt }]; an empty array falls back to `fallback`.
 * @param {string} alt      - base alt text for images that lack their own `alt`.
 * @param {string} fallback - local fallback URL shown when `images` is empty.
 * @param {string} aspect   - aspect-ratio utility for the main frame.
 * @param {string} rounded  - corner radius utility for the main frame.
 * @param {boolean} eager   - eagerly load the first frame (LCP).
 * @param {string} overlay  - gradient overlay over the main frame (theme hook).
 * @param {string} countClass - classes for the photo-count badge.
 * @param {string} thumbInactiveRing - classes for non-selected thumbnails.
 */
const Gallery = memo(function Gallery({
  images = [],
  alt = "",
  fallback = "",
  aspect = "aspect-[16/9] sm:aspect-[21/9]",
  rounded = "rounded-2xl",
  eager = false,
  overlay = "bg-gradient-to-t from-brand-950/45 via-transparent to-transparent",
  countClass = "bg-brand-950/70 text-cream",
  thumbInactiveRing = "ring-1 ring-brand-200 hover:ring-gold-400",
}) {
  const list = images.length ? images : [{ url: fallback, alt }];
  const [active, setActive] = useState(0);
  const index = Math.min(active, list.length - 1);
  const thumbCount = Math.min(list.length, 4);
  const extra = list.length - thumbCount;

  const select = useCallback((i) => setActive(i), []);

  return (
    <div>
      <div className={`relative overflow-hidden ${rounded} ${aspect}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={index}
            src={list[index]?.url}
            alt={list[index]?.alt || alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="h-full w-full object-cover"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        </AnimatePresence>
        <div
          className={`pointer-events-none absolute inset-0 ${overlay}`}
          aria-hidden="true"
        />
        <span className={`absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${countClass}`}>
          <Icon name="grid" size={14} /> {list.length} photo{list.length > 1 ? "s" : ""}
        </span>
      </div>

      {list.length > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {list.slice(0, thumbCount).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(i)}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={index === i}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg transition focus-visible:ring-2 focus-visible:ring-gold-400 ${
                index === i
                  ? "ring-2 ring-gold-500"
                  : thumbInactiveRing
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `${alt} photo ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {i === thumbCount - 1 && extra > 0 && (
                <span
                  className="absolute inset-0 flex items-center justify-center bg-brand-950/55 text-sm font-semibold text-cream"
                  aria-hidden="true"
                >
                  +{extra}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default Gallery;
