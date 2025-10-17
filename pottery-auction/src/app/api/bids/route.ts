import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/bids
 * Place a new bid on an item (authenticated users only)
 *
 * Body:
 * - item_id: string UUID (required)
 * - amount: number (required)
 *
 * Note: Stripe integration will be added in Phase 2 (Payments)
 * For now, all bids are created with status='pending'
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login to place a bid' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { item_id, amount } = body;

    // Validate required fields
    if (!item_id) {
      return NextResponse.json(
        { error: 'Missing required field: item_id' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Fetch the item to validate bid
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, title, starting_bid, current_bid, auction_id')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Validate bid amount is at least the starting bid
    if (amount < item.starting_bid) {
      return NextResponse.json(
        {
          error: `Bid must be at least the starting bid of $${item.starting_bid}`,
          minimum_bid: item.starting_bid,
        },
        { status: 400 }
      );
    }

    // Validate bid amount is higher than current bid
    if (amount <= item.current_bid) {
      return NextResponse.json(
        {
          error: `Bid must be higher than current bid of $${item.current_bid}`,
          minimum_bid: item.current_bid + 1, // Minimum increment of $1
        },
        { status: 400 }
      );
    }

    // If item has auction_id, check auction is active
    if (item.auction_id) {
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('id, status, end_date')
        .eq('id', item.auction_id)
        .single();

      if (auctionError || !auction) {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }

      if (auction.status !== 'active') {
        return NextResponse.json(
          { error: `Cannot bid on ${auction.status} auction` },
          { status: 400 }
        );
      }

      // Check if auction has ended
      const now = new Date();
      const endDate = new Date(auction.end_date);
      if (now > endDate) {
        return NextResponse.json(
          { error: 'Auction has ended' },
          { status: 400 }
        );
      }
    }

    // Use admin client for transaction-like operations
    const adminClient = createAdminClient();

    // Mark previous highest bid as 'outbid' if exists
    const { data: previousBids } = await adminClient
      .from('bids')
      .select('id, status')
      .eq('item_id', item_id)
      .eq('status', 'confirmed');

    if (previousBids && previousBids.length > 0) {
      await adminClient
        .from('bids')
        .update({ status: 'outbid' })
        .eq('item_id', item_id)
        .eq('status', 'confirmed');
    }

    // Create the new bid
    const { data: newBid, error: bidError } = await adminClient
      .from('bids')
      .insert({
        item_id,
        user_id: user.id,
        amount,
        status: 'confirmed', // Will be 'pending' when Stripe is integrated
      })
      .select()
      .single();

    if (bidError) {
      console.error('Error creating bid:', bidError);
      return NextResponse.json(
        { error: 'Failed to place bid', details: bidError.message },
        { status: 500 }
      );
    }

    // Update the item's current_bid and highest_bidder
    const { error: updateError } = await adminClient
      .from('items')
      .update({
        current_bid: amount,
        highest_bidder: user.id,
      })
      .eq('id', item_id);

    if (updateError) {
      console.error('Error updating item:', updateError);
      // Rollback: delete the bid we just created
      await adminClient.from('bids').delete().eq('id', newBid.id);

      return NextResponse.json(
        { error: 'Failed to update item with new bid', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        bid: newBid,
        message: 'Bid placed successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/bids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bids
 * Get user's own bids (authenticated users)
 * Admins can see all bids
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin || false;

    let query = supabase
      .from('bids')
      .select('*')
      .order('created_at', { ascending: false });

    // Non-admin users can only see their own bids
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bids:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bids', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ bids: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/bids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
