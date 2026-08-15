import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/theme/animations";

/**
 * Accessible tabs with full keyboard navigation (Left/Right/Home/End) and an
 * animated gold indicator.
 *
 * @param {Array} tabs - [{ key?, label, content }]
 */
const Tabs = ({ tabs = [], defaultIndex = 0, onChange }) => {
  const [active, setActive] = useState(defaultIndex);
  const tabRefs = useRef([]);

  const activate = (index) => {
    setActive(index);
    onChange?.(index);
  };

  const onKeyDown = (event, index) => {
    const count = tabs.length;
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % count;
    else if (event.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;

    if (next !== null) {
      event.preventDefault();
      activate(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="Tabs" className="flex gap-1 overflow-x-auto border-b border-brand-100">
        {tabs.map((tab, index) => {
          const selected = index === active;
          return (
            <button
              key={tab.key ?? index}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${index}`}
              aria-selected={selected}
              aria-controls={`panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => activate(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="relative whitespace-nowrap px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-900 focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              {tab.label}
              {selected && (
                <motion.span
                  layoutId="tabs-indicator"
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-gold-500"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="pt-5"
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
};

export default Tabs;