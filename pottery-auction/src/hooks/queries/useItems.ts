import { useQuery } from '@tanstack/react-query';
import { fetchItems, fetchItem, fetchFeaturedItems } from '@/lib/api-client';

/**
 * Hook to fetch all items
 * @param params - Optional filters (auction_id, featured)
 */
export function useItems(params?: { auction_id?: string; featured?: boolean }) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => fetchItems(params),
  });
}

/**
 * Hook to fetch a single item by ID
 */
export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => fetchItem(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch featured items for homepage
 */
export function useFeaturedItems(limit = 6) {
  return useQuery({
    queryKey: ['items', 'featured', limit],
    queryFn: () => fetchFeaturedItems(limit),
  });
}
