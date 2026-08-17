import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/theme/animations";
import Icon from "./Icons";
import useEscapeKey from "@/hooks/useEscapeKey";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import useFocusTrap from "@/hooks/useFocusTrap";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Accessible modal dialog rendered in a portal. Handles: Escape to close,
 * body scroll lock, focus trap, backdrop click, ARIA attributes, and an
 * animated open/close.
 */
const Modal = ({
  open = false,
  onClose,
  title,
  children,
  footer,
  size = "md",
  tone = "light",
  labelledBy = undefined,
}) => {
  const glass = tone === "glass";
  const dark = tone === "dark";
  const panelCls = glass
    ? "border border-[#D4AF37]/20 bg-[#0B0B0B]/95 text-cream shadow-[0_0_60px_rgba(212,175,55,0.16)] backdrop-blur-xl"
    : dark
      ? "bg-brand-950 text-cream border border-white/10"
      : "bg-white";
  const borderCls = glass ? "border-[#D4AF37]/15" : dark ? "border-white/10" : "border-brand-100";
  const titleCls = glass ? "text-[#F5F1E8]" : dark ? "text-cream" : "text-brand-900";
  const closeCls = glass || dark
    ? "text-cream/70 hover:bg-white/10 hover:text-gold-300"
    : "text-brand-500 hover:bg-brand-100 hover:text-brand-800";
  const backdropCls = glass ? "bg-black/70 backdrop-blur-sm" : "bg-brand-950/60 backdrop-blur-sm";
  const panelRef = useRef(null);
  const titleId = labelledBy || "modal-title";

  useEscapeKey(onClose, open);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-overlay flex items-end justify-center p-4 sm:items-center">
          <motion.div
            aria-hidden="true"
            className={`absolute inset-0 ${backdropCls}`}
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
            className={`relative flex max-h-[90vh] w-full ${SIZES[size]} flex-col rounded-2xl ${panelCls} shadow-2xl`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className={`flex items-center justify-between border-b ${borderCls} px-5 py-4`}>
              <h2 id={titleId} className={`font-serif text-lg font-semibold ${titleCls}`}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className={`rounded-full p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 ${closeCls}`}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className={`flex justify-end gap-3 border-t ${borderCls} px-5 py-4`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
