import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/commissions
 * List commissions
 * - Regular users: See only their own commissions
 * - Admins: See all commissions with optional status filter
 *
 * Query params (admin only):
 * - status: Filter by status (submitted/reviewing/accepted/declined/in_progress/completed)
 */
export async function GET(request: NextRequest) {
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
      .from('commissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (isAdmin) {
      // Admins can filter by status
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const validStatuses = ['submitted', 'reviewing', 'accepted', 'declined', 'in_progress', 'completed'];
      if (status && validStatuses.includes(status)) {
        query = query.eq('status', status as 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed');
      }
    } else {
      // Regular users only see their own commissions
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching commissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch commissions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ commissions: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/commissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/commissions
 * Submit a new commission request (authenticated users only)
 *
 * Body:
 * - email: string (required)
 * - name: string (required)
 * - description: string (required)
 * - images: string[] (optional, defaults to [])
 * - budget: number (optional)
 * - timeline: string (optional)
 *
 * Note: status will default to 'submitted'
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login to submit a commission' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, name, description, images, budget, timeline } = body;

    // Validate required fields
    if (!email || !name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, description' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate budget if provided
    if (budget !== undefined && budget !== null) {
      if (typeof budget !== 'number' || budget < 0) {
        return NextResponse.json(
          { error: 'Budget must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Use admin client to bypass RLS for insert
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('commissions')
      .insert({
        user_id: user.id,
        email,
        name,
        description,
        images: images || [],
        budget: budget || null,
        timeline: timeline || null,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating commission:', error);
      return NextResponse.json(
        { error: 'Failed to create commission', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        commission: data,
        message: 'Commission request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/commissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
