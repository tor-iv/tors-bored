import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { auctions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auctions
 * List all auctions with optional filtering.
 *
 * Query params:
 * - status: Filter by auction status (upcoming/active/ended)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const rows =
      status && ["upcoming", "active", "ended"].includes(status)
        ? await db
            .select()
            .from(auctions)
            .where(
              eq(
                auctions.status,
                status as "upcoming" | "active" | "closing" | "ended",
              ),
            )
            .orderBy(desc(auctions.start_date))
        : await db.select().from(auctions).orderBy(desc(auctions.start_date));

    return NextResponse.json({ auctions: rows });
  } catch (error) {
    console.error("Unexpected error in GET /api/auctions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/auctions
 * Create a new auction (admin only).
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 },
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, start_date, end_date, status, featured_image } = body;

    if (!title || !start_date || !end_date || !status) {
      return NextResponse.json(
        { error: "Missing required fields: title, start_date, end_date, status" },
        { status: 400 },
      );
    }

    if (!["upcoming", "active", "ended"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: upcoming, active, or ended" },
        { status: 400 },
      );
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO 8601 format" },
        { status: 400 },
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const [auction] = await db
      .insert(auctions)
      .values({
        title,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
        status,
        featured_image: featured_image || null,
      })
      .returning();

    return NextResponse.json({ auction }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/auctions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
