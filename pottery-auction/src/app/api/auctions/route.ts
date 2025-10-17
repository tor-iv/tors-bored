import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/auctions
 * List all auctions with optional filtering
 *
 * Query params:
 * - status: Filter by auction status (upcoming/active/ended)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('auctions')
      .select('*')
      .order('start_date', { ascending: false });

    // Filter by status if provided
    if (status && ['upcoming', 'active', 'ended'].includes(status)) {
      query = query.eq('status', status as 'upcoming' | 'active' | 'ended');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching auctions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch auctions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ auctions: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/auctions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auctions
 * Create a new auction (admin only)
 *
 * Body:
 * - title: string (required)
 * - description: string (optional)
 * - start_date: ISO date string (required)
 * - end_date: ISO date string (required)
 * - status: 'upcoming' | 'active' | 'ended' (required)
 * - featured_image: string URL (optional)
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
    const { title, description, start_date, end_date, status, featured_image } = body;

    // Validate required fields
    if (!title || !start_date || !end_date || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_date, end_date, status' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['upcoming', 'active', 'ended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: upcoming, active, or ended' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

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

    // Use admin client to bypass RLS for insert
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('auctions')
      .insert({
        title,
        description: description || null,
        start_date,
        end_date,
        status,
        featured_image: featured_image || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating auction:', error);
      return NextResponse.json(
        { error: 'Failed to create auction', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ auction: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/auctions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
