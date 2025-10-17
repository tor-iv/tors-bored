import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = Promise<{ id: string }>;

/**
 * GET /api/commissions/[id]
 * Get a single commission by ID
 * - Users can view their own commissions
 * - Admins can view any commission
 */
export async function GET(
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

    // Fetch the commission
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Commission not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching commission:', error);
      return NextResponse.json(
        { error: 'Failed to fetch commission', details: error.message },
        { status: 500 }
      );
    }

    // RLS will handle permission checks automatically
    // If user doesn't have access, data will be null

    return NextResponse.json({ commission: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/commissions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/commissions/[id]
 * Update a commission (admin only)
 *
 * Body (all fields optional):
 * - status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed'
 * - admin_notes: string
 * - budget: number (admin can adjust)
 * - timeline: string (admin can adjust)
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
    const { status, admin_notes, budget, timeline } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      const validStatuses = ['submitted', 'reviewing', 'accepted', 'declined', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }

    if (budget !== undefined) {
      if (budget !== null && (typeof budget !== 'number' || budget < 0)) {
        return NextResponse.json(
          { error: 'Budget must be a positive number or null' },
          { status: 400 }
        );
      }
      updates.budget = budget;
    }

    if (timeline !== undefined) {
      updates.timeline = timeline;
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
      .from('commissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Commission not found' },
          { status: 404 }
        );
      }

      console.error('Error updating commission:', error);
      return NextResponse.json(
        { error: 'Failed to update commission', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      commission: data,
      message: 'Commission updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/commissions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
