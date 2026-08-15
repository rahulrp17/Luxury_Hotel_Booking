import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/theme/animations";
import Icon from "./Icons";

/**
 * Accessible accordion with animated expand/collapse.
 *
 * @param {Array}  items          - [{ key?, title, content }]
 * @param {boolean} allowMultiple - allow several sections open at once
 * @param {Array}  defaultOpen    - indices open on first render
 */
const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  className = "",
  tone = "light",
}) => {
  const [openItems, setOpenItems] = useState(defaultOpen);
  const dark = tone === "dark";

  const toggle = (index) => {
    setOpenItems((prev) => {
      const isOpen = prev.includes(index);
      if (allowMultiple) {
        return isOpen ? prev.filter((i) => i !== index) : [...prev, index];
      }
      return isOpen ? [] : [index];
    });
  };

  const shellCls = dark
    ? "divide-y divide-[#D4AF37]/12 overflow-hidden rounded-xl border border-[#D4AF37]/15 bg-black/40"
    : "divide-y divide-brand-100 overflow-hidden rounded-xl border border-brand-100 bg-white";
  const titleCls = dark ? "font-medium text-[#F5F1E8]" : "font-medium text-brand-800";
  const bodyCls = dark ? "px-5 pb-4 text-sm text-[#A8A8A8]" : "px-5 pb-4 text-sm text-brand-600";

  return (
    <div className={`${shellCls} ${className}`}>
      {items.map((item, index) => {
        const open = openItems.includes(index);
        return (
          <div key={item.key ?? index}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <span className={titleCls}>{item.title}</span>
              <Icon
                name={open ? "chevronDown" : "chevronRight"}
                size={18}
                className={`text-gold-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <div className={bodyCls}>{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;