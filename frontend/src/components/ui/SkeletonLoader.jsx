/**
 * Skeleton loading placeholders (AureliaStay luxury theme).
 *
 * Every block renders the black + gold light-sweep shimmer (`.lux-skeleton`,
 * defined in index.css) and defaults to `tone="dark"` so skeletons never look
 * white. Compose the primitives (Block, Text, Circle, Image, Button) or use the
 * matching composites below so a loading state mirrors the real layout:
 *
 *   Cards       → Card / HotelCard / OfferCard / BookingCard / Stat
 *   Tables      → Table (admin rows)
 *   Grids       → Card, OfferCard, HotelCard inside the page grid
 *   Lists       → List / Row (avatar + lines)
 *   Forms       → Form (labels + inputs)
 *   Detail      → Panel / Summary / Chart
 *   Chips/pills → Chip (filters, suggestions, tabs)
 */

const Block = ({ className = "", tone = "dark", style }) => (
  <div
    aria-hidden="true"
    style={style}
    className={`lux-skeleton animate-pulse rounded-lg ${tone === "dark" ? "bg-white/[0.06]" : "bg-brand-200"} ${className}`}
  />
);

const SkeletonText = ({ lines = 3, className = "", tone = "dark" }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <Block key={index} tone={tone} className={`mb-2 h-3.5 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
    ))}
  </div>
);

const SkeletonCircle = ({ className = "", tone = "dark" }) => (
  <Block tone={tone} className={`h-10 w-10 rounded-full ${className}`} />
);

const SkeletonImage = ({ className = "", tone = "dark" }) => (
  <Block tone={tone} className={`aspect-[3/2] w-full ${className}`} />
);

const SkeletonButton = ({ className = "", tone = "dark" }) => (
  <Block tone={tone} className={`h-10 w-32 rounded-full ${className}`} />
);

const SkeletonChip = ({ className = "", tone = "dark" }) => (
  <Block tone={tone} className={`h-9 w-24 rounded-full ${className}`} />
);

/* A horizontal list/table row: avatar + text lines + trailing block. */
const SkeletonRow = ({ avatar = true, lines = 2, className = "", tone = "dark" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    {avatar && <SkeletonCircle tone={tone} className="h-11 w-11 shrink-0" />}
    <div className="min-w-0 flex-1">
      <SkeletonText tone={tone} lines={lines} />
    </div>
    <SkeletonButton tone={tone} className="h-9 w-24 shrink-0 rounded-lg" />
  </div>
);

const SkeletonList = ({ count = 3, avatar = true, lines = 2, tone = "dark", className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonRow key={index} avatar={avatar} lines={lines} tone={tone} />
    ))}
  </div>
);

/* Admin management-table skeleton (image/media column + text columns + actions). */
const SkeletonTable = ({
  columns = 5,
  rows = 5,
  withMedia = false,
  minWidth = 900,
  tone = "dark",
  className = "",
}) => (
  <div className={`overflow-x-auto ${className}`}>
    <div className="w-full text-sm" style={{ minWidth }}>
      <div className="flex items-center gap-4 border-b border-[#D4AF37]/15 bg-white/[0.02] px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Block key={index} tone={tone} className={`h-3 ${withMedia && index === 0 ? "w-16" : "flex-1"}`} />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 border-b border-white/[0.04] px-4 py-3.5">
          {withMedia ? (
            <>
              <Block tone={tone} className="h-10 w-14 shrink-0 rounded-lg" />
              <Block tone={tone} className="h-4 w-36 shrink-0" />
              {Array.from({ length: Math.max(columns - 3, 1) }).map((_, cellIndex) => (
                <Block key={cellIndex} tone={tone} className="h-4 flex-1" />
              ))}
              <Block tone={tone} className="h-8 w-8 shrink-0 rounded-lg" />
              <Block tone={tone} className="h-8 w-8 shrink-0 rounded-lg" />
            </>
          ) : (
            Array.from({ length: columns }).map((_, cellIndex) => (
              <Block key={cellIndex} tone={tone} className={`h-4 flex-1 ${cellIndex === columns - 1 ? "max-w-24" : ""}`} />
            ))
          )}
        </div>
      ))}
    </div>
  </div>
);

/* Form skeleton: gold label + input fields, optionally a two-column grid. */
const SkeletonForm = ({ fields = 4, columns = 2, tone = "dark", className = "" }) => (
  <div className={`grid gap-x-4 gap-y-5 ${columns === 2 ? "sm:grid-cols-2" : ""} ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className={columns === 2 && index === fields - 1 && fields % 2 === 1 ? "sm:col-span-2" : ""}>
        <Block tone={tone} className="mb-2 h-3 w-24" />
        <Block tone={tone} className="h-11 w-full rounded-xl" />
      </div>
    ))}
  </div>
);

/* Dashboard KPI stat card. */
const SkeletonStat = ({ tone = "dark", className = "" }) => (
  <div className={`rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5 backdrop-blur-xl ${className}`}>
    <div className="flex items-center justify-between gap-3">
      <Block tone={tone} className="h-3 w-24" />
      <Block tone={tone} className="h-9 w-9 shrink-0 rounded-full" />
    </div>
    <Block tone={tone} className="mt-4 h-7 w-28" />
    <Block tone={tone} className="mt-2 h-3 w-36" />
  </div>
);

/* Chart placeholder: faint gridlines + gold-tinted bars. */
const CHART_BARS = [40, 70, 55, 85, 60, 90, 45, 75];
const SkeletonChart = ({ tone = "dark", className = "" }) => (
  <div className={`relative h-full w-full overflow-hidden rounded-2xl ${className}`}>
    <div className="absolute inset-0 flex flex-col justify-between px-2 py-3">
      {[0, 1, 2, 3, 4].map((_, index) => (
        <Block key={index} tone={tone} className="h-px w-full" />
      ))}
    </div>
    <div className="absolute inset-x-4 bottom-3 top-10 flex items-end justify-between gap-2">
      {CHART_BARS.map((height, index) => (
        <Block key={index} tone={tone} className="flex-1 rounded-t-md" style={{ height: `${height}%` }} />
      ))}
    </div>
  </div>
);

/* Booking list card — matches MyBookings / AccountOverview rows. */
const SkeletonBookingCard = ({ tone = "dark", className = "" }) => (
  <div className={`flex flex-col gap-4 rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5 backdrop-blur-xl sm:flex-row sm:items-center ${className}`}>
    <Block tone={tone} className="h-36 w-full shrink-0 rounded-xl sm:h-24 sm:w-32" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <Block tone={tone} className="h-5 w-40" />
        <Block tone={tone} className="h-5 w-16 rounded-full" />
      </div>
      <Block tone={tone} className="mt-2 h-3 w-48" />
      <Block tone={tone} className="mt-2 h-3 w-64" />
      <Block tone={tone} className="mt-2 h-3 w-40" />
    </div>
    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
      <Block tone={tone} className="h-6 w-24" />
      <Block tone={tone} className="h-4 w-20" />
    </div>
  </div>
);

/* Luxury offer card — matches the public offers grids. */
const SkeletonOfferCard = ({ tone = "dark", className = "" }) => (
  <div className={`overflow-hidden rounded-3xl border border-[#D4AF37]/15 bg-[#0E0E0E] shadow-[0_15px_40px_rgba(0,0,0,0.45)] ${className}`}>
    <SkeletonImage tone={tone} className="aspect-[16/10] w-full" />
    <div className="p-5">
      <Block tone={tone} className="h-3 w-28" />
      <Block tone={tone} className="mt-3 h-6 w-3/4" />
      <Block tone={tone} className="mt-3 h-4 w-full" />
      <Block tone={tone} className="mt-2 h-4 w-2/3" />
      <div className="mt-5 flex items-center justify-between gap-3">
        <Block tone={tone} className="h-5 w-24" />
        <Block tone={tone} className="h-10 w-28 rounded-full" />
      </div>
    </div>
  </div>
);

/* Hotel card skeleton — grid & list variants mirror HotelCard. */
const SkeletonHotelCard = ({ view = "grid", tone = "dark", className = "" }) => {
  if (view === "list") {
    return (
      <div className={`flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#080808] sm:flex-row ${className}`}>
        <Block tone={tone} className="h-56 w-full shrink-0 rounded-none sm:h-auto sm:w-[300px] lg:w-[360px]" />
        <div className="min-w-0 flex-1 p-5 sm:p-6 lg:p-7">
          <Block tone={tone} className="h-3 w-28" />
          <Block tone={tone} className="mt-3 h-6 w-2/3" />
          <Block tone={tone} className="mt-2 h-3 w-40" />
          <Block tone={tone} className="mt-5 h-4 w-full" />
          <Block tone={tone} className="mt-2 h-4 w-5/6" />
          <Block tone={tone} className="mt-2 h-4 w-2/3" />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Block tone={tone} className="h-6 w-28" />
            <Block tone={tone} className="h-11 w-28 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#080808] shadow-[0_15px_50px_rgba(0,0,0,0.18)] ${className}`}>
      <SkeletonImage tone={tone} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Block tone={tone} className="h-3 w-32" />
        <Block tone={tone} className="mt-3 h-5 w-2/3" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Block tone={tone} className="h-6 w-16 rounded-full" />
          <Block tone={tone} className="h-6 w-20 rounded-full" />
          <Block tone={tone} className="h-6 w-14 rounded-full" />
        </div>
        <div className="mt-5 h-px w-full bg-white/10" />
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <Block tone={tone} className="h-3 w-20" />
            <Block tone={tone} className="mt-1 h-6 w-24" />
          </div>
          <Block tone={tone} className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/* Generic glass panel — good for auth/verification & summary loading. */
const SkeletonPanel = ({ tone = "dark", className = "" }) => (
  <div className={`lux-glass p-8 sm:p-10 ${className}`}>
    <div className="flex flex-col items-center py-6 text-center">
      <SkeletonCircle tone={tone} className="h-16 w-16" />
      <Block tone={tone} className="mt-6 h-6 w-48" />
      <Block tone={tone} className="mt-3 h-3 w-72" />
      <Block tone={tone} className="mt-1.5 h-3 w-56" />
      <SkeletonButton tone={tone} className="mt-8 w-40" />
    </div>
  </div>
);

/* Checkout / booking summary sidebar. */
const SkeletonSummary = ({ tone = "dark", className = "" }) => (
  <div className={`rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl ${className}`}>
    <SkeletonImage tone={tone} className="aspect-[16/9] w-full rounded-xl" />
    <SkeletonText tone={tone} lines={2} className="mt-4" />
    <div className="mt-4 space-y-2 border-t border-[#D4AF37]/12 pt-4">
      <div className="flex items-center justify-between gap-3">
        <Block tone={tone} className="h-3 w-20" />
        <Block tone={tone} className="h-3 w-16" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Block tone={tone} className="h-3 w-24" />
        <Block tone={tone} className="h-3 w-14" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Block tone={tone} className="h-3 w-16" />
        <Block tone={tone} className="h-3 w-20" />
      </div>
    </div>
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#D4AF37]/12 pt-4">
      <Block tone={tone} className="h-5 w-24" />
      <Block tone={tone} className="h-6 w-24" />
    </div>
    <SkeletonButton tone={tone} className="mt-6 h-12 w-full" />
  </div>
);

const SkeletonCard = ({ className = "", tone = "dark" }) => (
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
  Chip: SkeletonChip,
  Row: SkeletonRow,
  List: SkeletonList,
  Table: SkeletonTable,
  Form: SkeletonForm,
  Stat: SkeletonStat,
  Chart: SkeletonChart,
  BookingCard: SkeletonBookingCard,
  OfferCard: SkeletonOfferCard,
  HotelCard: SkeletonHotelCard,
  Panel: SkeletonPanel,
  Summary: SkeletonSummary,
  Card: SkeletonCard,
};

export default SkeletonLoader;