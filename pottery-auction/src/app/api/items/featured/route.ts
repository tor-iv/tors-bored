import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/items/featured
 * Get all featured items for homepage display
 *
 * Query params:
 * - limit: Maximum number of items to return (defaults to 6)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 6;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 50' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch featured items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/items/featured:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
