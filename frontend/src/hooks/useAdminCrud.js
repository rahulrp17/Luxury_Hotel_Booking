import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/services";

/**
 * Generic admin CRUD hook for list + create/update/delete operations.
 * Handles: pagination, cache invalidation, optimistic updates, error handling.
 *
 * @param {Object} config
 * @param {string[]} config.baseKey - Base query key (e.g. ["admin", "amenities"])
 * @param {Function} config.listFn - API function to fetch list: (params) => Promise<{data, pagination}>
 * @param {Function} config.createFn - API function to create: (payload) => Promise
 * @param {Function} config.updateFn - API function to update: (id, payload) => Promise
 * @param {Function} config.deleteFn - API function to delete: (id) => Promise
 * @param {number} [config.pageSize=12] - Items per page
 * @param {Object} [config.defaultParams={}] - Extra query params
 * @param {Object} [config.options={}] - Additional options
 * @param {boolean} [config.options.optimisticUpdate=true] - Use optimistic updates for instant UI
 * @param {Function} [config.options.getOptimisticId] - Extract ID from created item for optimistic delete
 * @param {string} [config.options.successMessage] - Base success message
 * @param {string} [config.options.errorMessage] - Base error message
 */
export function useAdminCrud(config) {
  const {
    baseKey,
    listFn,
    createFn,
    updateFn,
    deleteFn,
    pageSize = 12,
    defaultParams = {},
    options = {},
  } = config;

  const {
    optimisticUpdate = true,
    getOptimisticId = (item) => item._id,
    successMessage = "Operation successful",
    errorMessage = "Operation failed",
  } = options;

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [extraParams, setExtraParams] = useState(defaultParams);

  // Build query key with page and extra params
  const queryKey = [...baseKey, page, extraParams];

  // Fetch list
  const query = useQuery({
    queryKey,
    queryFn: () => listFn({ page, limit: pageSize, ...extraParams }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous, // keepPreviousData equivalent
  });

  // Invalidate all pages for this resource
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: baseKey });
  }, [queryClient, baseKey]);

  // Optimistic update helpers
  const updateCache = useCallback((updater) => {
    queryClient.setQueriesData({ queryKey: baseKey }, (old) => {
      if (!old) return old;
      return {
        ...old,
        data: updater(old.data || []),
      };
    });
  }, [queryClient, baseKey]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn,
    onMutate: optimisticUpdate ? async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: baseKey });
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);
      // Optimistically add to first page
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItem, _id: tempId, _optimistic: true };
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return { ...old, data: [optimisticItem, ...(old.data || [])] };
      });
      return { previousData };
    } : undefined,
    onError: (err, newItem, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notify.errorFrom(err, errorMessage.replace("Operation", "Create"));
    },
    onSuccess: (serverItem) => {
      // Replace optimistic item with server response
      if (optimisticUpdate) {
        const tempId = queryClient.getQueryData(queryKey)?.data?.find((d) => d._optimistic)?._id;
        if (tempId) {
          updateCache((items) =>
            items.map((item) => (item._id === tempId ? serverItem : item))
          );
        }
      }
      notify.success(`${successMessage}.`);
      invalidate();
    },
    onSettled: () => {
      invalidate();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateFn(id, payload),
    onMutate: optimisticUpdate ? async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: baseKey });
      const previousData = queryClient.getQueryData(queryKey);
      updateCache((items) =>
        items.map((item) => (item._id === id ? { ...item, ...payload, _optimistic: true } : item))
      );
      return { previousData };
    } : undefined,
    onError: (err, vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notify.errorFrom(err, errorMessage.replace("Operation", "Update"));
    },
    onSuccess: (serverItem) => {
      notify.success(`${successMessage}.`);
      invalidate();
    },
    onSettled: () => {
      invalidate();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onMutate: optimisticUpdate ? async (id) => {
      await queryClient.cancelQueries({ queryKey: baseKey });
      const previousData = queryClient.getQueryData(queryKey);
      updateCache((items) => items.filter((item) => item._id !== id));
      return { previousData };
    } : undefined,
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      notify.errorFrom(err, errorMessage.replace("Operation", "Delete"));
    },
    onSuccess: () => {
      notify.success(`${successMessage}.`);
      invalidate();
    },
    onSettled: () => {
      invalidate();
    },
  });

  const loading = query.isLoading && (!query.data || query.data.data?.length === 0);
  const data = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return {
    // Data
    data,
    pagination,
    loading,
    error: query.error,
    page,
    setPage,
    extraParams,
    setExtraParams,

    // Mutations
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Helpers
    refetch: query.refetch,
    invalidate,
  };
}

export default useAdminCrud;