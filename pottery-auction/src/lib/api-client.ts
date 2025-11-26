/**
 * API Client for Pottery Auction Marketplace
 *
 * This file contains wrapper functions for all API routes.
 * Each function handles fetch requests, error handling, and type safety.
 */

// ============================================
// AUCTIONS
// ============================================

export async function fetchAuctions(params?: { status?: string }) {
  const query = params?.status ? `?status=${params.status}` : '';
  const res = await fetch(`/api/auctions${query}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch auctions' }));
    throw new Error(error.error || 'Failed to fetch auctions');
  }

  return res.json();
}

export async function fetchAuction(id: string) {
  const res = await fetch(`/api/auctions/${id}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch auction' }));
    throw new Error(error.error || 'Failed to fetch auction');
  }

  return res.json();
}

export async function createAuction(data: {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'ended';
  featured_image?: string;
}) {
  const res = await fetch('/api/auctions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create auction' }));
    throw new Error(error.error || 'Failed to create auction');
  }

  return res.json();
}

export async function updateAuction(id: string, data: Partial<{
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'ended';
  featured_image: string;
}>) {
  const res = await fetch(`/api/auctions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to update auction' }));
    throw new Error(error.error || 'Failed to update auction');
  }

  return res.json();
}

export async function deleteAuction(id: string) {
  const res = await fetch(`/api/auctions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete auction' }));
    throw new Error(error.error || 'Failed to delete auction');
  }

  return res.json();
}

export async function fetchAuctionItems(auctionId: string) {
  const res = await fetch(`/api/auctions/${auctionId}/items`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch auction items' }));
    throw new Error(error.error || 'Failed to fetch auction items');
  }

  return res.json();
}

// ============================================
// ITEMS
// ============================================

export async function fetchItems(params?: {
  auction_id?: string;
  featured?: boolean;
}) {
  const queryParams = new URLSearchParams();
  if (params?.auction_id) queryParams.append('auction_id', params.auction_id);
  if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));

  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await fetch(`/api/items${query}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch items' }));
    throw new Error(error.error || 'Failed to fetch items');
  }

  return res.json();
}

export async function fetchFeaturedItems(limit = 6) {
  const res = await fetch(`/api/items/featured?limit=${limit}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch featured items' }));
    throw new Error(error.error || 'Failed to fetch featured items');
  }

  return res.json();
}

export async function fetchItem(id: string) {
  const res = await fetch(`/api/items/${id}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch item' }));
    throw new Error(error.error || 'Failed to fetch item');
  }

  return res.json();
}

export async function createItem(data: {
  title: string;
  description?: string;
  auction_id?: string;
  images?: string[];
  starting_bid: number;
  dimensions?: { height?: number; width?: number; depth?: number };
  techniques?: string[];
  weight?: number;
  featured?: boolean;
}) {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create item' }));
    throw new Error(error.error || 'Failed to create item');
  }

  return res.json();
}

export async function updateItem(id: string, data: Partial<{
  title: string;
  description: string;
  auction_id: string | null;
  images: string[];
  starting_bid: number;
  current_bid: number;
  highest_bidder: string | null;
  dimensions: { height?: number; width?: number; depth?: number };
  techniques: string[];
  weight: number;
  featured: boolean;
}>) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to update item' }));
    throw new Error(error.error || 'Failed to update item');
  }

  return res.json();
}

export async function deleteItem(id: string) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete item' }));
    throw new Error(error.error || 'Failed to delete item');
  }

  return res.json();
}

// ============================================
// BIDS
// ============================================

export async function placeBid(data: {
  item_id: string;
  amount: number;
}) {
  const res = await fetch('/api/bids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to place bid' }));
    throw new Error(error.error || 'Failed to place bid');
  }

  return res.json();
}

export async function fetchUserBids() {
  const res = await fetch('/api/bids');

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch bids' }));
    throw new Error(error.error || 'Failed to fetch bids');
  }

  return res.json();
}

export async function fetchItemBids(itemId: string) {
  const res = await fetch(`/api/bids/item/${itemId}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch item bids' }));
    throw new Error(error.error || 'Failed to fetch item bids');
  }

  return res.json();
}

// ============================================
// COMMISSIONS
// ============================================

export async function fetchCommissions(params?: { status?: string }) {
  const query = params?.status ? `?status=${params.status}` : '';
  const res = await fetch(`/api/commissions${query}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch commissions' }));
    throw new Error(error.error || 'Failed to fetch commissions');
  }

  return res.json();
}

export async function fetchCommission(id: string) {
  const res = await fetch(`/api/commissions/${id}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch commission' }));
    throw new Error(error.error || 'Failed to fetch commission');
  }

  return res.json();
}

export async function createCommission(data: {
  email: string;
  name: string;
  description: string;
  images?: string[];
  budget?: number;
  timeline?: string;
}) {
  const res = await fetch('/api/commissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create commission' }));
    throw new Error(error.error || 'Failed to create commission');
  }

  return res.json();
}

export async function updateCommission(id: string, data: Partial<{
  status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed';
  admin_notes: string;
  budget: number;
  timeline: string;
}>) {
  const res = await fetch(`/api/commissions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to update commission' }));
    throw new Error(error.error || 'Failed to update commission');
  }

  return res.json();
}
