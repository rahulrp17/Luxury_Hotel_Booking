import { useCallback, useEffect, useRef, useState } from "react";
import { toErrorMessage } from "@/api";

/**
 * Feature-scoped async data hook. Fetches via the service layer and exposes
 * { data, loading, error, refetch }.
 *
 * The fetcher is read from a ref (never a dependency), so the effect only
 * re-runs when `enabled` or the caller's `deps` change — this prevents
 * duplicate/unbounded requests when an inline arrow is passed on every render.
 * A request id guards against stale responses resolving out of order.
 */
const useAsyncData = (fetcher, deps = [], enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  const requestRef = useRef(0);
  const abortRef = useRef(null);
  fetcherRef.current = fetcher;

  const load = useCallback(() => {
    // Abort any in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestRef.current;
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const current = fetcherRef.current;
    Promise.resolve(current(controller.signal))
      .then((res) => {
        if (requestRef.current === requestId) setData(res?.data ?? res);
      })
      .catch((err) => {
        if (requestRef.current === requestId) {
          setError(toErrorMessage(err, "Could not load data."));
        }
      })
      .finally(() => {
        if (requestRef.current === requestId) setLoading(false);
      });
  }, [enabled]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...deps]);

  return { data, loading, error, refetch: load };
};

export default useAsyncData;
