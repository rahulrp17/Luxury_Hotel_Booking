import { memo } from "react";
import Icon from "@/components/ui/Icons";

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
];

const Toolbar = memo(function Toolbar({ total, sort, onSort, view, onView, onOpenFilters }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          className="btn-outline px-3 py-2 border-gold-500 border-2 text-white hover:border-gold-500 hover:bg-gold-500 hover:text-black   md:hidden"
          aria-label="Open filters"
        >
          <Icon name="filter" size={16} /> Filters
        </button>
        <p className="text-md text-brand-300" aria-live="polite">
          <span className="font-medium text-brand-100">{total}</span> Luxury stays found
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-brand-500">
          <span className="hidden sm:inline">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            aria-label="Sort results"
            className="outline-gold-500 outline-2 rounded-full w-auto px-2 !py-2 pr-8"
          >
            {SORTS.map((s) => (
              <option className="bg-black text-white" key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className="flex items-center rounded-full border border-brand-200 p-0.5 border-gold-500 border-2"
          role="group"
          aria-label="View"
        >
          <button
            type="button"
            onClick={() => onView("grid")}
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            className={`rounded-full p-2 transition-colors ${view === "grid" ? "bg-gold-500 text-black" : "text-brand-200 hover:text-gold-500"
              }`}
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            type="button"
            onClick={() => onView("list")}
            aria-pressed={view === "list"}
            aria-label="List view"
            className={`rounded-full p-2 transition-colors ${view === "list" ? "bg-gold-500 text-black" : "text-brand-200 hover:text-gold-500"
              }`}
          >
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default Toolbar;
