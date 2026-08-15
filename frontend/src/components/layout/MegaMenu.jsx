import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { EASE } from "@/theme/animations";
import { Image } from "@/components/ui";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useEscapeKey from "@/hooks/useEscapeKey";
import { isImplementedPath } from "@/constants/routes";

const WIDTHS = {
  lg: "w-[46rem]",
  md: "w-[34rem]",
};

/** Shared trigger styles — mirrored between the navigable NavLink and the
 *  non-navigating button used for out-of-scope sections (never a dead link). */
const triggerClass = (isActive) =>
  `relative flex items-center gap-1 rounded-full px-0 py-2 text-sm font-medium transition-colors ${isActive ? "text-gold-300" : "text-cream/80 hover:text-gold-300"
  } after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gold-500 after:transition-transform after:duration-300 hover:after:scale-x-100`;

/**
 * Editorial luxury mega menu / dropdown.
 *
 * Sections without a real destination page (e.g. Experiences / Dining / About /
 * Contact) still render — the trigger becomes a focusable button that toggles
 * the panel and every contained link shows an "unavailable" treatment instead
 * of navigating to a dead route. Implemented sections keep the NavLink.
 *
 * @param {string}  label     - trigger label
 * @param {string}  to        - section route (navigates on click, if implemented)
 * @param {Array}   columns   - [{ title, links: [{ label, to }] }]
 * @param {Object}  [featured]- { image, title, description, cta, to }
 * @param {"lg"|"md"} width   - panel width
 * @param {"left"|"center"|"right"} align - horizontal alignment
 */
const MegaMenu = ({ label, to, columns = [], featured, width = "md", align = "center" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const closeTimer = useRef(null);
  const implemented = isImplementedPath(to);

  useOnClickOutside(rootRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const colCount = columns.length >= 2 ? 2 : 1;
  const alignCls =
    align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2";

  return (
    <div ref={rootRef} className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      {implemented ? (
        <NavLink
          to={to}
          onFocus={openMenu}
          className={({ isActive }) => triggerClass(isActive)}
        >
          {label}
          <ChevronDown size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </NavLink>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onFocus={openMenu}
          onClick={() => setOpen((value) => !value)}
          className={triggerClass(false)}
        >
          {label}
          <ChevronDown size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className={`absolute top-full z-50 pt-5 ${alignCls}`}
            initial={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div
              className={`flex gap-8 rounded-3xl border border-white/10 bg-brand-950/95 p-8 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl ${WIDTHS[width]}`}
            >
              {/* Link columns */}
              <div
                className={`grid flex-1 gap-x-10 gap-y-7 ${colCount === 2 ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {columns.map((col) => (
                  <div key={col.title}>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400/80">
                      {col.title}
                    </p>
                    <ul className="space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          {isImplementedPath(link.to) ? (
                            <Link
                              to={link.to}
                              className="group/link flex items-center gap-2 text-sm text-cream/75 transition-colors hover:text-gold-300"
                            >
                              <span className="h-px w-3 bg-gold-500/50 transition-all duration-300 group-hover/link:w-5 group-hover/link:bg-gold-400" />
                              {link.label}
                            </Link>
                          ) : (
                            <span
                              aria-disabled="true"
                              className="flex cursor-not-allowed items-center gap-2 text-sm text-cream/40"
                              title="Coming soon"
                            >
                              <span className="h-px w-3 bg-gold-500/25" />
                              {link.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {featured && isImplementedPath(featured.to) ? (
                <Link to={featured.to} className="group/card relative h-64 w-56 shrink-0 overflow-hidden rounded-2xl shadow-xl">
                  <Image src={featured.image} alt={featured.title} kind="hotel" cover hover rounded="rounded-none" aspect="aspect-auto" eager fetchPriority="high" className="h-full w-full" />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent" />

                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <p className="font-serif text-bold leading-tight text-gold-200">{featured.title}</p>

                    {featured.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-snug text-cream">{featured.description}</p>
                    )}

                    <span className="mt-2 flex items-center gap-1 text-xs text-gold-300">
                      {featured.cta || "Explore"} <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ) : featured ? (
                <div aria-disabled="true" title="Coming soon" className="relative h-64 w-56 shrink-0 cursor-not-allowed overflow-hidden rounded-2xl opacity-80 shadow-xl">
                  <Image src={featured.image} alt={featured.title} kind="hotel" cover hover={false} rounded="rounded-none" aspect="aspect-auto" eager fetchPriority="high" className="h-full w-full" />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent" />

                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <p className="font-serif text-lg leading-tight text-cream">{featured.title}</p>

                    {featured.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-snug text-cream/90">{featured.description}</p>
                    )}

                    <span className="mt-2 flex items-center gap-1 text-xs text-gold-300">
                      {featured.cta || "Explore"} <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaMenu;
