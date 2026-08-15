/**
 * Skeleton loading placeholders (animated pulse). Compose named variants for
 * common shapes: text lines, circles, images, cards.
 *
 * `tone="dark"` renders a subtle white-on-black shimmer for dark luxury
 * surfaces instead of the default light-gray block.
 */

const Block = ({ className = "", tone = "light" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-lg ${tone === "dark" ? "bg-white/[0.07]" : "bg-brand-100"} ${className}`}
  />
);

const SkeletonText = ({ lines = 3, className = "", tone }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <Block key={index} tone={tone} className={`mb-2 h-3.5 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
    ))}
  </div>
);

const SkeletonCircle = ({ className = "", tone }) => (
  <Block tone={tone} className={`h-10 w-10 rounded-full! ${className}`} />
);

const SkeletonImage = ({ className = "", tone }) => (
  <Block tone={tone} className={`aspect-[3/2] w-full ${className}`} />
);

const SkeletonButton = ({ className = "", tone }) => (
  <Block tone={tone} className={`h-10 w-32 rounded-full ${className}`} />
);

const SkeletonCard = ({ className = "", tone }) => (
  <div
    className={`${
      tone === "dark"
        ? "rounded-2xl border border-[#D4AF37]/15 bg-white/[0.04] backdrop-blur-xl"
        : "card"
    } overflow-hidden ${className}`}
  >
    <SkeletonImage tone={tone} />
    <div className="p-4">
      <SkeletonText tone={tone} lines={2} />
      <SkeletonButton tone={tone} className="mt-3" />
    </div>
  </div>
);

const SkeletonLoader = {
  Block,
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Image: SkeletonImage,
  Button: SkeletonButton,
  Card: SkeletonCard,
};

export default SkeletonLoader;