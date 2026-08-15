import { forwardRef } from "react";

/**
 * Frosted-glass surface. Best used over a dark/gradient or hero background so
 * the translucency + blur read clearly. Pure Tailwind utilities (no inline
 * styles).
 */
const GlassCard = forwardRef(function GlassCard(
  { className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default GlassCard;
