import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { commissions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/commissions
 * List commissions.
 * - Regular users: see only their own commissions.
 * - Admins: see all commissions with optional ?status= filter.
 *
 * Migrated from Supabase to Drizzle/Postgres. RLS is gone — ownership filter is
 * applied explicitly here for non-admins.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 },
      );
    }

    let rows;

    if (user.isAdmin) {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");

      const validStatuses = ["submitted", "reviewing", "accepted", "declined", "in_progress", "completed"];

      if (status && validStatuses.includes(status)) {
        rows = await db
          .select()
          .from(commissions)
          .where(
            eq(
              commissions.status,
              status as "submitted" | "reviewing" | "accepted" | "declined" | "in_progress" | "completed",
            ),
          )
          .orderBy(desc(commissions.submitted_at));
      } else {
        rows = await db
          .select()
          .from(commissions)
          .orderBy(desc(commissions.submitted_at));
      }
    } else {
      // RLS-backstop: non-admins explicitly filtered to their own commissions.
      rows = await db
        .select()
        .from(commissions)
        .where(eq(commissions.user_id, user.id))
        .orderBy(desc(commissions.submitted_at));
    }

    return NextResponse.json({ commissions: rows });
  } catch (error) {
    console.error("Unexpected error in GET /api/commissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/commissions
 * Submit a new commission request (authenticated users only).
 *
 * Body:
 * - email: string (required)
 * - name: string (required)
 * - description: string (required)
 * - images: string[] (optional, defaults to [])
 * - budget: number (optional)
 * - timeline: string (optional)
 *
 * Note: status defaults to 'submitted'; user_id is set from the session.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please login to submit a commission" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { email, name, description, images, budget, timeline } = body;

    if (!email || !name || !description) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, description" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (budget !== undefined && budget !== null) {
      if (typeof budget !== "number" || budget < 0) {
        return NextResponse.json(
          { error: "Budget must be a positive number" },
          { status: 400 },
        );
      }
    }

    const [commission] = await db
      .insert(commissions)
      .values({
        user_id: user.id,
        email,
        name,
        description,
        images: images || [],
        budget: budget ?? null,
        timeline: timeline ?? null,
        status: "submitted",
      })
      .returning();

    return NextResponse.json(
      { commission, message: "Commission request submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/commissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
