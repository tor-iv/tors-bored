import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ itemId: string }>;

/**
 * GET /api/bids/item/[itemId]
 * Get all bids for a specific item
 *
 * Note: Due to RLS policies, regular users can only see their own bids.
 * Admins can see all bids for the item.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { itemId } = await params;
    const supabase = await createClient();

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, title, current_bid')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Get all bids for this item
    // RLS will automatically filter based on user permissions
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('*')
      .eq('item_id', itemId)
      .order('amount', { ascending: false });

    if (bidsError) {
      console.error('Error fetching bids:', bidsError);
      return NextResponse.json(
        { error: 'Failed to fetch bids', details: bidsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      item: {
        id: item.id,
        title: item.title,
        current_bid: item.current_bid,
      },
      bids: bids || [],
      count: bids?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/bids/item/[itemId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
