import { useCallback, useState } from "react";

/**
 * Boilerplate state for Modal/Drawer open/close/toggle.
 */
const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return { isOpen, open, close, toggle, setIsOpen };
};

export default useModal;
