import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = Promise<{ id: string }>;

/**
 * GET /api/auctions/[id]
 * Get a single auction by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching auction:', error);
      return NextResponse.json(
        { error: 'Failed to fetch auction', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ auction: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/auctions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auctions/[id]
 * Update an auction (admin only)
 *
 * Body (all fields optional):
 * - title: string
 * - description: string
 * - start_date: ISO date string
 * - end_date: ISO date string
 * - status: 'upcoming' | 'active' | 'ended'
 * - featured_image: string URL
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
    const { title, description, start_date, end_date, status, featured_image } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (status !== undefined) {
      if (!['upcoming', 'active', 'ended'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: upcoming, active, or ended' },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    if (featured_image !== undefined) updates.featured_image = featured_image;

    // Validate dates if both are being updated
    if (updates.start_date && updates.end_date) {
      const startDate = new Date(updates.start_date as string);
      const endDate = new Date(updates.end_date as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use ISO 8601 format' },
          { status: 400 }
        );
      }

      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for update
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('auctions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }

      console.error('Error updating auction:', error);
      return NextResponse.json(
        { error: 'Failed to update auction', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ auction: data });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/auctions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auctions/[id]
 * Delete an auction (admin only)
 *
 * Note: This will cascade delete all items in the auction due to foreign key constraint
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
      .from('auctions')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }

      console.error('Error deleting auction:', error);
      return NextResponse.json(
        { error: 'Failed to delete auction', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/auctions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
