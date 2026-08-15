import { QueryClient, keepPreviousData } from "@tanstack/react-query";

/**
 * Shared React Query client for the Home page data flow.
 *
 * - `staleTime`: featured lists are treated as fresh for 5 minutes, so repeat
 *   visits / remounts render instantly without re-fetching.
 * - `gcTime`: unused queries stay in memory for 30 minutes (no instant GC).
 * - `placeholderData`: keeps the previous data on screen during background
 *   refetches — no flash-of-skeleton.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    },
  },
});
