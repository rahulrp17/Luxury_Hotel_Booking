import { memo, useRef } from "react";
import { HOTEL_CATEGORIES } from "@/constants/enums";
import Icon from "@/components/ui/Icons";

const STAR_OPTIONS = [1, 2, 3, 4, 5];

const FilterSidebar = memo(function FilterSidebar({
  filters,
  amenities = [],
  onChange,
  onReset,
  onApply,
  mobile = false,
}) {
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const openDatePicker = (ref) => {
    const input = ref.current;

    if (!input) return;

    // Chrome / Edge / modern browsers
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // fallback below
      }
    }

    input.focus();
    input.click();
  };

  const toggleAmenity = (id) => {
    const next = filters.amenities.includes(id)
      ? filters.amenities.filter((a) => a !== id)
      : [...filters.amenities, id];

    onChange("amenities", next);
  };

  const toggleStar = (value) => {
    onChange(
      "starRating",
      filters.starRating === value ? "" : value
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply?.();
      }}
      className="
        w-full
        min-w-0
        overflow-hidden
        rounded-[28px]
        border border-[#2b2924]
        bg-[#090909]
        text-white
        shadow-[0_25px_70px_rgba(0,0,0,0.28)]
      "
      aria-label="Hotel filters"
    >
      {/* ================= HEADER ================= */}
      <div className="border-b border-white/10 px-5 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d7ad43]">
              Refine your stay
            </p>

            <h2 className="font-serif text-2xl leading-tight text-[#f5f0e6] sm:text-[28px]">
              Search & Filters
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/45">
              Find the perfect stay for your journey.
            </p>
          </div>

          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-full
              border border-[#c9a43a]/30
              bg-[#c9a43a]/5
              text-[#d7ad43]
            "
          >
            <Icon name="search" size={18} />
          </div>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="space-y-6 px-5 py-6 sm:px-6">

        {/* Destination */}
        <Field label="Destination">
          <div className="relative w-full">
            <span
              className="
                pointer-events-none
                absolute left-4 top-1/2
                -translate-y-1/2
                text-[#c9a43a]
              "
            >
              <Icon name="search" size={17} />
            </span>

            <input
              type="text"
              value={filters.destination}
              onChange={(e) =>
                onChange("destination", e.target.value)
              }
              placeholder="City or country"
              className="
                luxury-input
                w-full
                pl-11
              "
            />
          </div>
        </Field>

        {/* ================= DATES ================= */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Check-in">
            <DateInput
              ref={checkInRef}
              value={filters.checkIn}
              onChange={(e) =>
                onChange("checkIn", e.target.value)
              }
              onClick={() => openDatePicker(checkInRef)}
              ariaLabel="Check-in date"
            />
          </Field>

          <Field label="Check-out">
            <DateInput
              ref={checkOutRef}
              value={filters.checkOut}
              onChange={(e) =>
                onChange("checkOut", e.target.value)
              }
              onClick={() => openDatePicker(checkOutRef)}
              ariaLabel="Check-out date"
            />
          </Field>
        </div>

        {/* ================= GUESTS ================= */}
        <Field label="Guests">
          <div className="relative w-full">
            <select
              value={filters.adults}
              onChange={(e) =>
                onChange("adults", Number(e.target.value))
              }
              className="
                luxury-input
                w-full
                cursor-pointer
                appearance-none
                pr-10
              "
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option
                  key={n}
                  value={n}
                  className="bg-[#0b0b0b] text-white"
                >
                  {n} {n > 1 ? "guests" : "guest"}
                </option>
              ))}
            </select>

            <span
              className="
                pointer-events-none
                absolute right-4 top-1/2
                -translate-y-1/2
                text-[#d7ad43]
              "
            >
              ↓
            </span>
          </div>
        </Field>

        {/* ================= PRICE ================= */}
        <Field label="Price per night">
          <div className="grid w-full grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            <PriceInput
              value={filters.minPrice}
              onChange={(e) =>
                onChange("minPrice", e.target.value)
              }
              placeholder="Minimum"
              ariaLabel="Minimum price"
            />

            <PriceInput
              value={filters.maxPrice}
              onChange={(e) =>
                onChange("maxPrice", e.target.value)
              }
              placeholder="Maximum"
              ariaLabel="Maximum price"
            />
          </div>
        </Field>

        {/* ================= STAR RATING ================= */}
        <Field label="Star rating">
          <div className="grid grid-cols-5 gap-2">
            {STAR_OPTIONS.map((value) => {
              const active = filters.starRating === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleStar(value)}
                  aria-pressed={active}
                  aria-label={`${value} star${value > 1 ? "s" : ""
                    }`}
                  className={`
                    flex
                    h-11
                    min-w-0
                    items-center
                    justify-center
                    gap-1
                    rounded-xl
                    border
                    text-sm
                    transition-all
                    duration-200

                    ${active
                      ? "border-[#d7ad43] bg-[#d7ad43] text-[#090909] shadow-[0_8px_25px_rgba(215,173,67,0.18)]"
                      : "border-white/10 bg-white/[0.025] text-white/65 hover:border-[#d7ad43]/50 hover:bg-[#d7ad43]/10 hover:text-[#d7ad43]"
                    }
                  `}
                >
                  <span>{value}</span>
                  <span className="text-[#d7ad43]">★</span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* ================= PROPERTY TYPE ================= */}
        <Field label="Property type">
          <div className="flex w-full flex-wrap gap-2">
            {Object.values(HOTEL_CATEGORIES).map((cat) => {
              const active = filters.category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    onChange(
                      "category",
                      active ? "" : cat
                    )
                  }
                  aria-pressed={active}
                  className={`
                    max-w-full
                    rounded-full
                    border
                    px-3.5
                    py-2
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.08em]
                    transition-all
                    duration-200
                    ${active
                      ? "border-[#d7ad43] bg-[#d7ad43] text-[#090909]"
                      : "border-white/10 bg-white/[0.025] text-white/60 hover:border-[#d7ad43]/40 hover:text-[#d7ad43]"
                    }
                  `}
                >
                  {cat.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </Field>

        {/* ================= AMENITIES ================= */}
        <Field label="Amenities">
          {amenities.length ? (
            <div
              className="
        max-h-52
        w-full
        space-y-1
        overflow-y-auto
        pr-1
        luxury-scrollbar
      "
            >
              {amenities.map((a) => {
                const checked = filters.amenities.includes(a._id);

                return (
                  <button
                    key={a._id}
                    type="button"
                    onClick={() => toggleAmenity(a._id)}
                    aria-pressed={checked}
                    className="
              group
              flex
              w-full
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              transition-colors
              hover:bg-white/[0.04]
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#d7ad43]/50
            "
                  >
                    {/* Checkbox UI */}
                    <span
                      className={`
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-md
                border
                transition-all
                ${checked
                          ? "border-[#d7ad43] bg-[#d7ad43] text-black"
                          : "border-white/20 bg-transparent"
                        }
              `}
                    >
                      {checked && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </span>

                    {/* Amenity name */}
                    <span
                      className="
                min-w-0
                truncate
                text-sm
                text-white/65
                transition-colors
                group-hover:text-white
              "
                    >
                      {a.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-white/35">
              Amenities loading…
            </p>
          )}
        </Field>

        {/* ================= ACTIONS ================= */}
        <div className="border-t border-white/10 pt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              className="
                group
                flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#d7ad43]
                px-5
                text-sm
                font-semibold
                text-[#090909]
                shadow-[0_12px_30px_rgba(215,173,67,0.16)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#e3bd5b]
              "
            >
              Apply filters
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="
                flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/[0.03]
                px-5
                text-sm
                text-white/60
                transition-all
                hover:border-[#d7ad43]/40
                hover:text-[#d7ad43]
              "
              aria-label="Reset filters"
            >
              <Icon name="close" size={15} />
              <span className="sm:hidden">
                Reset
              </span>
            </button>
          </div>
        </div>

        {/* Mobile result button */}
        {mobile && (
          <button
            type="button"
            onClick={onApply}
            className="
              flex
              min-h-12
              w-full
              items-center
              justify-center
              rounded-full
              border
              border-[#d7ad43]
              bg-transparent
              px-5
              text-sm
              font-semibold
              text-[#d7ad43]
              transition-all
              hover:bg-[#d7ad43]
              hover:text-[#090909]
            "
          >
            Show results
          </button>
        )}
      </div>
    </form>
  );
});

/* =========================================================
   FIELD
========================================================= */

const Field = ({ label, children }) => (
  <div className="w-full min-w-0">
    <label
      className="
        mb-2.5
        block
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.24em]
        text-[#d7ad43]
      "
    >
      {label}
    </label>

    <div className="w-full min-w-0">
      {children}
    </div>
  </div>
);

/* =========================================================
   DATE INPUT
========================================================= */

const DateInput = ({
  value,
  onChange,
  onClick,
  ariaLabel,
  ref,
}) => (
  <div
    className="
      group
      relative
      w-full
      min-w-0
      cursor-pointer
    "
    onClick={onClick}
  >
    <input
      ref={ref}
      type="date"
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className="
        luxury-input
        w-full
        min-w-0
        cursor-pointer
        appearance-none
        pr-11
        [&::-webkit-calendar-picker-indicator]:absolute
        [&::-webkit-calendar-picker-indicator]:right-4
        [&::-webkit-calendar-picker-indicator]:cursor-pointer
        [&::-webkit-calendar-picker-indicator]:opacity-0
      "
    />

    <span
      className="
        pointer-events-none
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        text-[#d7ad43]
        transition-transform
        duration-200
        group-hover:scale-110
      "
    >
      <Icon name="calendar" size={17} />
    </span>
  </div>
);

/* =========================================================
   PRICE INPUT
========================================================= */

const PriceInput = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) => (
  <div className="relative w-full min-w-0">
    <span
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-sm
        text-[#d7ad43]
      "
    >
      ₹
    </span>

    <input
      type="number"
      min="0"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="
        luxury-input
        w-full
        min-w-0
        pl-9
        pr-3
      "
    />
  </div>
);

export default FilterSidebar;