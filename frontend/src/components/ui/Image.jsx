import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FALLBACK_ASSETS } from "@/constants/assets";
import { buildResponsiveSrcSet } from "@/utils/helpers";

const resolveImageSource = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return value.url || value.secure_url || value.src || value.path || "";
  }

  return "";
};

const Image = ({
  src,
  alt = "",
  fallbackSrc,
  srcSet,
  kind = "default",
  className = "",
  imgClassName = "",
  aspect = "aspect-[3/2]",
  rounded = "rounded-2xl",
  cover = true,
  eager = false,
  hover = true,
  overlay = false,
  sizes,
  fetchPriority = "auto",
  ...motionProps
}) => {
  const fallback = fallbackSrc || FALLBACK_ASSETS[kind] || FALLBACK_ASSETS.default;
  const resolvedSrc = resolveImageSource(src);
  const resolvedFallback = resolveImageSource(fallback);

  const [source, setSource] = useState(resolvedSrc || resolvedFallback);
  const [loading, setLoading] = useState(Boolean(resolvedSrc));

  useEffect(() => {
    const nextSource = resolvedSrc || resolvedFallback;

    setSource(nextSource);
    setLoading(Boolean(resolvedSrc));
  }, [resolvedSrc, resolvedFallback]);

  const handleError = () => {
    if (source !== resolvedFallback && resolvedFallback) {
      setSource(resolvedFallback);
      setLoading(true);
      return;
    }

    setLoading(false);
  };

  return (
    <motion.div className={`group relative overflow-hidden ${rounded} ${aspect} ${className}`} {...motionProps}>
      {loading && <div className="absolute inset-0 z-0 animate-pulse bg-brand-100" aria-hidden="true" />}

      <img
        src={source}
        srcSet={srcSet || buildResponsiveSrcSet(source)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : fetchPriority}
        sizes={sizes}
        draggable={false}
        className={`relative z-[1] h-full w-full ${cover ? "object-cover" : ""} transition-transform duration-700 ${hover ? "group-hover:scale-110" : ""} ${imgClassName}`}
        onLoad={() => setLoading(false)}
        onError={handleError}
      />

      {overlay && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" aria-hidden="true" />}
    </motion.div>
  );
};

export default Image;