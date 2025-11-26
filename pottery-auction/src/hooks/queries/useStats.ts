import { useQuery } from '@tanstack/react-query';
import { fetchAuctions, fetchItems, fetchCommissions, fetchUserBids } from '@/lib/api-client';

/**
 * Hook to fetch dashboard statistics
 * Aggregates data from multiple API endpoints
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [auctionsRes, itemsRes, commissionsRes, bidsRes] = await Promise.all([
        fetchAuctions(),
        fetchItems(),
        fetchCommissions({ status: 'submitted' }),
        fetchUserBids().catch(() => ({ bids: [] })), // Fallback if not admin
      ]);

      const auctions = auctionsRes.auctions || [];
      const items = itemsRes.items || [];
      const commissions = commissionsRes.commissions || [];
      const bids = bidsRes.bids || [];

      // Calculate stats
      const activeAuctions = auctions.filter((a: { status: string }) => a.status === 'active').length;
      const totalItems = items.length;
      const pendingCommissions = commissions.length;

      // Calculate total revenue from won bids
      const totalRevenue = bids
        .filter((bid: { status: string }) => bid.status === 'won')
        .reduce((sum: number, bid: { amount: number }) => sum + bid.amount, 0);

      return {
        activeAuctions,
        totalRevenue,
        totalItems,
        pendingCommissions,
        auctions,
        items,
        commissions,
        bids,
      };
    },
  });
}
