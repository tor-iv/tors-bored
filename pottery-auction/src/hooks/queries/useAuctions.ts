import { useQuery } from '@tanstack/react-query';
import { fetchAuctions, fetchAuction, fetchAuctionItems } from '@/lib/api-client';

/**
 * Hook to fetch all auctions
 * @param status - Optional filter by status (upcoming, active, ended)
 */
export function useAuctions(status?: string) {
  return useQuery({
    queryKey: ['auctions', status],
    queryFn: () => fetchAuctions(status ? { status } : undefined),
  });
}

/**
 * Hook to fetch a single auction by ID
 */
export function useAuction(id: string) {
  return useQuery({
    queryKey: ['auctions', id],
    queryFn: () => fetchAuction(id),
    enabled: !!id, // Only run if id is provided
  });
}

/**
 * Hook to fetch items in a specific auction
 */
export function useAuctionItems(auctionId: string) {
  return useQuery({
    queryKey: ['auctions', auctionId, 'items'],
    queryFn: () => fetchAuctionItems(auctionId),
    enabled: !!auctionId,
  });
}
