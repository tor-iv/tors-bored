import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/items
 * List all items with optional filtering
 *
 * Query params:
 * - auction_id: Filter by auction ID
 * - featured: Filter by featured status (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get('auction_id');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by auction_id if provided
    if (auctionId) {
      query = query.eq('auction_id', auctionId);
    }

    // Filter by featured status if provided
    if (featured === 'true') {
      query = query.eq('featured', true);
    } else if (featured === 'false') {
      query = query.eq('featured', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Create a new item (admin only)
 *
 * Body:
 * - title: string (required)
 * - description: string (optional)
 * - auction_id: string UUID (optional)
 * - images: string[] (optional, defaults to [])
 * - starting_bid: number (required)
 * - dimensions: { height?: number, width?: number, depth?: number } (optional)
 * - techniques: string[] (optional, defaults to [])
 * - weight: number (optional)
 * - featured: boolean (optional, defaults to false)
 */
export async function POST(request: NextRequest) {
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      auction_id,
      images,
      starting_bid,
      dimensions,
      techniques,
      weight,
      featured
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    if (starting_bid === undefined || starting_bid === null) {
      return NextResponse.json(
        { error: 'Missing required field: starting_bid' },
        { status: 400 }
      );
    }

    // Validate starting_bid is a positive number
    if (typeof starting_bid !== 'number' || starting_bid < 0) {
      return NextResponse.json(
        { error: 'starting_bid must be a positive number' },
        { status: 400 }
      );
    }

    // If auction_id provided, verify it exists
    if (auction_id) {
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('id')
        .eq('id', auction_id)
        .single();

      if (auctionError || !auction) {
        return NextResponse.json(
          { error: 'Invalid auction_id - auction not found' },
          { status: 400 }
        );
      }
    }

    // Use admin client to bypass RLS for insert
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('items')
      .insert({
        title,
        description: description || null,
        auction_id: auction_id || null,
        images: images || [],
        starting_bid,
        current_bid: starting_bid, // Initialize current_bid to starting_bid
        dimensions: dimensions || null,
        techniques: techniques || [],
        weight: weight || null,
        featured: featured || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return NextResponse.json(
        { error: 'Failed to create item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
