import { createContext, useContext, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useEscapeKey from "@/hooks/useEscapeKey";

const ALIGN = {
  left: "left-0 origin-top-left",
  right: "right-0 origin-top-right",
};

const DropdownContext = createContext(false);

/**
 * Accessible dropdown menu. Supports controlled or uncontrolled open state.
 * `children` may be a render prop receiving `{ close }` for close-on-select.
 *
 * `dark` renders a premium black-and-gold glass panel (used on the dashboard
 * chrome); the default is the light surface for public pages.
 *
 * Usage:
 *   <Dropdown trigger={<span>Menu</span>} dark>
 *     {( { close } ) => (
 *       <>
 *         <Dropdown.Item onClick={...}>Profile</Dropdown.Item>
 *         <Dropdown.Divider />
 *         <Dropdown.Item onClick={...}>Logout</Dropdown.Item>
 *       </>
 *     )}
 *   </Dropdown>
 */
const Dropdown = ({
  trigger,
  children,
  align = "right",
  dark = false,
  open: openProp = undefined,
  onOpenChange = undefined,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = (value) => {
    if (isControlled) onOpenChange?.(value);
    else setInternalOpen(value);
  };

  const rootRef = useRef(null);
  useOnClickOutside(rootRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  const content =
    typeof children === "function" ? children({ close: () => setOpen(false) }) : children;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-full transition-colors hover:text-gold-600 focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className={`absolute z-[9999] mt-2 min-w-48 max-w-[calc(100vw-24px)] rounded-xl border p-1.5 shadow-lg ${ALIGN[align]} ${dark
                ? "border-[#D4AF37]/20 bg-[#0A0A0A]/95 shadow-[0_24px_70px_rgba(0,0,0,0.65),0_0_35px_rgba(212,175,55,0.12)] backdrop-blur-[20px]"
                : "border-brand-100 bg-white shadow-lg"
              }`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <DropdownContext.Provider value={dark}>{content}</DropdownContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ children, onClick, icon, className = "" }) => {
  const dark = useContext(DropdownContext);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full  items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 ${dark
          ? "text-[#F5F1E8] hover:bg-[#D4AF37]/10 hover:text-[#E7C977]"
          : "text-brand-700 hover:bg-brand-50 hover:text-gold-600"
        } ${className}`}
    >
      {icon && <span className={dark ? "text-[#C9AB4B]" : "text-brand-400"}>{icon}</span>}
      {children}
    </button>
  );
};

const DropdownDivider = () => {
  const dark = useContext(DropdownContext);
  return <div className={`my-1.5 h-px ${dark ? "bg-[#D4AF37]/15" : "bg-brand-100"}`} />;
};

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export { DropdownItem, DropdownDivider };
export default Dropdown;