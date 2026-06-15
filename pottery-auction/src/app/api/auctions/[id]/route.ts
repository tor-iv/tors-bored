import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auctions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = Promise<{ id: string }>;

/**
 * GET /api/auctions/[id]
 * Get a single auction by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;

    const [auction] = await db
      .select()
      .from(auctions)
      .where(eq(auctions.id, id))
      .limit(1);

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    return NextResponse.json({ auction });
  } catch (error) {
    console.error("Unexpected error in GET /api/auctions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/auctions/[id]
 * Update an auction (admin only).
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
  { params }: { params: Params },
) {
  try {
    const { id } = await params;

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

    type AuctionUpdate = {
      title?: string;
      description?: string | null;
      start_date?: Date;
      end_date?: Date;
      status?: "upcoming" | "active" | "closing" | "ended";
      featured_image?: string | null;
      updated_at?: Date;
    };

    const updates: AuctionUpdate = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      if (!["upcoming", "active", "ended"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be: upcoming, active, or ended" },
          { status: 400 },
        );
      }
      updates.status = status as "upcoming" | "active" | "closing" | "ended";
    }
    if (featured_image !== undefined) updates.featured_image = featured_image;

    // Parse and validate dates
    if (start_date !== undefined || end_date !== undefined) {
      const parsedStart = start_date !== undefined ? new Date(start_date) : undefined;
      const parsedEnd = end_date !== undefined ? new Date(end_date) : undefined;

      if (parsedStart && isNaN(parsedStart.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Use ISO 8601 format" },
          { status: 400 },
        );
      }
      if (parsedEnd && isNaN(parsedEnd.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Use ISO 8601 format" },
          { status: 400 },
        );
      }
      if (parsedStart && parsedEnd && parsedEnd <= parsedStart) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 },
        );
      }

      if (parsedStart) updates.start_date = parsedStart;
      if (parsedEnd) updates.end_date = parsedEnd;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date();

    const [auction] = await db
      .update(auctions)
      .set(updates)
      .where(eq(auctions.id, id))
      .returning();

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    return NextResponse.json({ auction });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/auctions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/auctions/[id]
 * Delete an auction (admin only).
 *
 * Note: This will cascade delete all items in the auction due to foreign key constraint.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;

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

    await db.delete(auctions).where(eq(auctions.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/auctions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
