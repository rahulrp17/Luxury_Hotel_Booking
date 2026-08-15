import { useCallback } from "react";
import { notify } from "@/services";

/**
 * Hook exposing toast helpers. Thin wrapper over the notify service so
 * components can import a hook instead of the singleton.
 */
const useToast = () => {
  const success = useCallback((message) => notify.success(message), []);
  const error = useCallback((message) => notify.error(message), []);
  const info = useCallback((message) => notify.info(message), []);
  const loading = useCallback((message) => notify.loading(message), []);

  return { success, error, info, loading };
};

export default useToast;