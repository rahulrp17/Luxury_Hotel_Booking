import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/services";

/**
 * Admin delete mutation that keeps lists in sync with the server instantly:
 *
 * 1. Optimistically updates every matching cached list *before* the request
 *    resolves, so the row disappears (or flips to inactive) immediately.
 * 2. Snapshots the previous cache state and rolls it back on error.
 * 3. Invalidates every registered query prefix on settle so server truth wins.
 *
 * @param {Object} config
 * @param {Function} config.deleteFn - (id) => Promise — the API delete call.
 * @param {Array<{key: string[], mode: "remove"|"deactivate"}>} config.keys -
 *   Query-key prefixes to optimistically update. `"remove"` drops the row from
 *   cached lists (hard deletes / active-only lists); `"deactivate"` flips the
 *   row to `isActive: false` (soft deletes shown as inactive in admin lists).
 * @param {string} [config.successMessage] - Toast on success.
 * @param {string} [config.errorMessage] - Fallback toast on error.
 */
export function useOptimisticDelete({
  deleteFn,
  keys = [],
  successMessage = "Item removed.",
  errorMessage = "We couldn't remove this item.",
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFn,

    onMutate: async (id) => {
      // Stop any in-flight refetches so they cannot overwrite our optimistic row.
      for (const { key } of keys) {
        await queryClient.cancelQueries({ queryKey: key });
      }

      const previous = keys.map(({ key }) => [key, queryClient.getQueriesData({ queryKey: key })]);

      for (const { key, mode } of keys) {
        queryClient.setQueriesData({ queryKey: key }, (old) => {
          if (!old || typeof old !== "object" || !Array.isArray(old.data)) return old;

          const data =
            mode === "deactivate"
              ? old.data.map((item) =>
                  item?._id === id ? { ...item, isActive: false } : item
                )
              : old.data.filter((item) => item?._id !== id);

          return { ...old, data };
        });
      }

      return { previous };
    },

    onError: (err, id, context) => {
      context?.previous?.forEach(([key, entries]) => {
        entries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      });
      notify.errorFrom(err, errorMessage);
    },

    onSuccess: () => {
      notify.success(successMessage);
    },

    onSettled: () => {
      for (const { key } of keys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export default useOptimisticDelete;