import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/theme/animations";
import Icon from "./Icons";
import useEscapeKey from "@/hooks/useEscapeKey";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import useFocusTrap from "@/hooks/useFocusTrap";

const SIDES = {
  left: "inset-y-0 left-0",
  right: "inset-y-0 right-0",
};

const slideVariants = {
  left: { hidden: { x: "-100%" }, visible: { x: 0 } },
  right: { hidden: { x: "100%" }, visible: { x: 0 } },
};

/**
 * Accessible slide-in panel. Slides from `side`, traps focus, locks body
 * scroll, closes on Escape or backdrop click.
 */
const Drawer = ({
  open = false,
  onClose,
  title,
  children,
  side = "right",
  width = "max-w-md",
  labelledBy = undefined,
  panelClassName = "",
  backdropClassName = "bg-brand-950/50 backdrop-blur-sm",
  headerClassName = "border-brand-100",
  titleClassName = "text-brand-900",
  closeClassName = "text-brand-500 hover:bg-brand-100 hover:text-brand-800",
}) => {
  const panelRef = useRef(null);
  const titleId = labelledBy || "drawer-title";

  useEscapeKey(onClose, open);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-overlay">
          <motion.div
            aria-hidden="true"
            className={`absolute inset-0 ${backdropClassName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`absolute ${SIDES[side]} flex w-full ${width} flex-col shadow-2xl ${panelClassName}`}
            variants={slideVariants[side]}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.32, ease: EASE }}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${headerClassName}`}
            >
              <h2
                id={titleId}
                className={`font-serif text-lg font-semibold ${titleClassName}`}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className={`rounded-full p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 ${closeClassName}`}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Drawer;
