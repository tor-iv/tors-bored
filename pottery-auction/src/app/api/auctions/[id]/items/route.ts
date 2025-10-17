import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ id: string }>;

/**
 * GET /api/auctions/[id]/items
 * Get all items in a specific auction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // First verify the auction exists
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('id, title, status')
      .eq('id', id)
      .single();

    if (auctionError) {
      if (auctionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching auction:', auctionError);
      return NextResponse.json(
        { error: 'Failed to fetch auction', details: auctionError.message },
        { status: 500 }
      );
    }

    // Fetch all items in this auction
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('auction_id', id)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      auction: {
        id: auction.id,
        title: auction.title,
        status: auction.status,
      },
      items: items || [],
      count: items?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/auctions/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
