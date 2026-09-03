import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { commissions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = Promise<{ id: string }>;

/**
 * GET /api/commissions/[id]
 * Get a single commission by ID.
 * - Users can view their own commissions.
 * - Admins can view any commission.
 *
 * Migrated from Supabase to Drizzle/Postgres. RLS is gone — ownership is
 * enforced explicitly: non-admins who request another user's commission get 404.
 */
export async function GET(
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

    const [commission] = await db
      .select()
      .from(commissions)
      .where(eq(commissions.id, id))
      .limit(1);

    if (!commission) {
      return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    }

    // RLS-backstop: non-admins may only view their own commissions.
    if (!user.isAdmin && commission.user_id !== user.id) {
      return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    }

    return NextResponse.json({ commission });
  } catch (error) {
    console.error("Unexpected error in GET /api/commissions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/commissions/[id]
 * Update a commission (admin only).
 *
 * Body (all fields optional):
 * - status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed'
 * - admin_notes: string
 * - budget: number (admin can adjust)
 * - timeline: string (admin can adjust)
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
    const { status, admin_notes, budget, timeline } = body;

    const updates: Partial<{
      status: "submitted" | "reviewing" | "accepted" | "declined" | "in_progress" | "completed";
      admin_notes: string;
      budget: number | null;
      timeline: string | null;
      updated_at: Date;
    }> = {};

    if (status !== undefined) {
      const validStatuses = ["submitted", "reviewing", "accepted", "declined", "in_progress", "completed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 },
        );
      }
      updates.status = status;
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }

    if (budget !== undefined) {
      if (budget !== null && (typeof budget !== "number" || budget < 0)) {
        return NextResponse.json(
          { error: "Budget must be a positive number or null" },
          { status: 400 },
        );
      }
      updates.budget = budget;
    }

    if (timeline !== undefined) {
      updates.timeline = timeline;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date();

    const [commission] = await db
      .update(commissions)
      .set(updates)
      .where(eq(commissions.id, id))
      .returning();

    if (!commission) {
      return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    }

    return NextResponse.json({
      commission,
      message: "Commission updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/commissions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
