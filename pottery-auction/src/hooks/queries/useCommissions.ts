import { useQuery } from '@tanstack/react-query';
import { fetchCommissions, fetchCommission } from '@/lib/api-client';

/**
 * Hook to fetch commissions
 * - Regular users: See their own commissions
 * - Admins: See all commissions with optional status filter
 *
 * @param status - Optional filter by status (admin only)
 */
export function useCommissions(status?: string) {
  return useQuery({
    queryKey: ['commissions', status],
    queryFn: () => fetchCommissions(status ? { status } : undefined),
  });
}

/**
 * Hook to fetch a single commission by ID
 */
export function useCommission(id: string) {
  return useQuery({
    queryKey: ['commissions', id],
    queryFn: () => fetchCommission(id),
    enabled: !!id,
  });
}
