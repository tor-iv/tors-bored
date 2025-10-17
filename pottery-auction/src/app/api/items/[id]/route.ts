import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = Promise<{ id: string }>;

/**
 * GET /api/items/[id]
 * Get a single item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching item:', error);
      return NextResponse.json(
        { error: 'Failed to fetch item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/items/[id]
 * Update an item (admin only)
 *
 * Body (all fields optional):
 * - title: string
 * - description: string
 * - auction_id: string UUID
 * - images: string[]
 * - starting_bid: number
 * - current_bid: number
 * - highest_bidder: string UUID
 * - dimensions: object
 * - techniques: string[]
 * - weight: number
 * - featured: boolean
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
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
      current_bid,
      highest_bidder,
      dimensions,
      techniques,
      weight,
      featured
    } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (auction_id !== undefined) {
      // Verify auction exists if not null
      if (auction_id !== null) {
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
      updates.auction_id = auction_id;
    }
    if (images !== undefined) updates.images = images;
    if (starting_bid !== undefined) {
      if (typeof starting_bid !== 'number' || starting_bid < 0) {
        return NextResponse.json(
          { error: 'starting_bid must be a positive number' },
          { status: 400 }
        );
      }
      updates.starting_bid = starting_bid;
    }
    if (current_bid !== undefined) updates.current_bid = current_bid;
    if (highest_bidder !== undefined) updates.highest_bidder = highest_bidder;
    if (dimensions !== undefined) updates.dimensions = dimensions;
    if (techniques !== undefined) updates.techniques = techniques;
    if (weight !== undefined) updates.weight = weight;
    if (featured !== undefined) updates.featured = featured;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for update
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      console.error('Error updating item:', error);
      return NextResponse.json(
        { error: 'Failed to update item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[id]
 * Delete an item (admin only)
 *
 * Note: This will cascade delete all bids for this item due to foreign key constraint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
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

    // Use admin client to bypass RLS for delete
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      console.error('Error deleting item:', error);
      return NextResponse.json(
        { error: 'Failed to delete item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
