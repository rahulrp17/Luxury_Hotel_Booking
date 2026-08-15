import { useEffect, useState, useCallback } from "react";
import { toErrorMessage } from "@/api";

/**
 * Generic paginated data-fetching hook.
 *
 * @param {Function} fetcher - async (params) => { data, pagination }
 * @param {Object}   baseParams - fixed query params
 * @param {Object}   [options]
 * @param {number}   options.pageSize - items per request (default 12)
 * @param {boolean}  options.enabled - skip fetching until true
 *
 * Returns { data, pagination, loading, error, page, setPage, refetch }.
 */
const usePaginatedQuery = (fetcher, baseParams = {}, { pageSize = 12, enabled = true } = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher({ ...baseParams, page, limit: pageSize });
      setData(res?.data ?? []);
      setPagination(res?.pagination ?? null);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, pageSize, baseParams]);

  useEffect(() => {
    if (enabled) run();
  }, [run, enabled]);

  const refetch = useCallback(() => run(), [run]);

  return { data, pagination, loading, error, page, setPage, refetch };
};

export default usePaginatedQuery;