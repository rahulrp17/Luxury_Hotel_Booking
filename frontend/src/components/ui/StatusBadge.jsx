/**
 * Colour-coded status pill. Tones are keyed by the backend status values
 * (booking + payment), defaulting to a neutral badge for anything unknown.
 */
const TONES = {
  // Booking statuses
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-gold-500 text-brand-950",
  CHECKED_IN: "bg-emerald-100 text-emerald-800",
  CHECKED_OUT: "bg-brand-100 text-brand-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
  // Payment statuses
  CREATED: "bg-amber-100 text-amber-800",
  AUTHORIZED: "bg-sky-100 text-sky-800",
  CAPTURED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-700",
};

const DARK_TONES = {
  // Booking statuses
  PENDING: "border border-amber-200/25 bg-amber-400/10 text-amber-200",
  CONFIRMED: "border border-[#D4AF37]/45 bg-[#D4AF37]/15 text-[#F1D477]",
  CHECKED_IN: "border border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  CHECKED_OUT: "border border-white/15 bg-white/[0.06] text-[#B8B2A5]",
  CANCELLED: "border border-red-400/30 bg-red-500/10 text-red-300",
  REFUNDED: "border border-purple-300/30 bg-purple-400/10 text-purple-200",
  // Payment statuses
  CREATED: "border border-amber-200/25 bg-amber-400/10 text-amber-200",
  AUTHORIZED: "border border-sky-300/30 bg-sky-400/10 text-sky-200",
  CAPTURED: "border border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  FAILED: "border border-red-400/30 bg-red-500/10 text-red-300",
};

const humanize = (status = "") =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

const StatusBadge = ({ status = "", className = "", label, tone = "light" }) => {
  const palette = tone === "dark" ? DARK_TONES : TONES;
  const fallback = tone === "dark" ? "border border-white/15 bg-white/[0.06] text-[#B8B2A5]" : "bg-brand-100 text-brand-700";
  return (
    <span className={`badge ${palette[status] || fallback} ${className}`}>
      {label || humanize(status) || "—"}
    </span>
  );
};

export default StatusBadge;
