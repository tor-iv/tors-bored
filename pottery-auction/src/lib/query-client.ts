import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 *
 * Default settings for all queries:
 * - staleTime: 30 seconds (data considered fresh for 30s)
 * - cacheTime: 5 minutes (unused data kept in cache for 5min)
 * - retry: 1 (retry failed requests once)
 * - refetchOnWindowFocus: false (don't refetch when user switches tabs)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
