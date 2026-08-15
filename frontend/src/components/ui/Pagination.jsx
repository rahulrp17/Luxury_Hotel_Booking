import Icon from "./Icons";

const buildPages = (current, total, sibling) => {
  if (total <= 1 + sibling * 2 + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  const left = Math.max(2, current - sibling);
  const right = Math.min(total - 1, current + sibling);
  if (left > 2) pages.push("ellipsis-left");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
};

const pageButtonClass = (active, tone) =>
  `inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 ${
    tone === "dark"
      ? active
        ? "border border-[#D4AF37]/45 bg-[#D4AF37]/15 text-[#F1D477] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
        : "text-[#B8B2A5] hover:bg-[#D4AF37]/10 hover:text-[#E7C977]"
      : active
        ? "bg-brand-950 text-cream"
        : "text-brand-700 hover:bg-brand-100 hover:text-brand-900"
  }`;

const navButtonClass = (tone) =>
  `inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
    tone === "dark"
      ? "text-[#B8B2A5] hover:bg-white/[0.04] hover:text-[#E7C977]"
      : "text-brand-600 hover:bg-brand-100 hover:text-brand-900"
  }`;

/**
 * Accessible pagination control with windowed page numbers.
 */
const Pagination = ({
  page = 1,
  totalPages = 1,
  onChange = () => {},
  siblingCount = 1,
  tone = "light",
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages, siblingCount);

  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            className={navButtonClass(tone)}
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
            aria-label="Previous page"
          >
            <Icon name="chevronRight" size={16} className="rotate-180" />
          </button>
        </li>

        {pages.map((p) =>
          typeof p === "string" ? (
            <li key={p} className={`px-1 ${tone === "dark" ? "text-[#77736B]" : "text-brand-400"}`}>
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={pageButtonClass(p === page, tone)}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            </li>
          )
        )}

        <li>
          <button
            type="button"
            className={navButtonClass(tone)}
            disabled={page >= totalPages}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;