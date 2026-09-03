import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";

/**
 * GET /api/items/featured
 * Get all featured items for homepage display
 *
 * Query params:
 * - limit: Maximum number of items to return (defaults to 6)
 *
 * Migrated from Supabase to Drizzle/Postgres.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 6;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 50" },
        { status: 400 },
      );
    }

    const rows = await db
      .select()
      .from(items)
      .where(eq(items.featured, true))
      .orderBy(desc(items.created_at))
      .limit(limit);

    return NextResponse.json({ items: rows, count: rows.length });
  } catch (error) {
    console.error("Unexpected error in GET /api/items/featured:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
