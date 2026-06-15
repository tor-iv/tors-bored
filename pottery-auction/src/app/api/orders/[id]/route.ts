import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, order_items, items } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id] — fetch a single order with nested order_items + item data.
 * RLS-backstop: after fetching, enforce order.user_id === user.id || user.isAdmin.
 * Non-owners get 404 (consistent with the old Supabase behaviour of filtering by
 * user_id in the query, which also produced a 404 "Not found" for mismatches).
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the order row.
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Owner check — admins bypass.
    if (order.user_id !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch order_items joined to items for id/sku/title/images/techniques/dimensions/weight
    // — the [id] endpoint returns the extended item fields (matches old Supabase select).
    const itemRows = await db
      .select({
        id: order_items.id,
        order_id: order_items.order_id,
        item_id: order_items.item_id,
        price_cents: order_items.price_cents,
        source: order_items.source,
        created_at: order_items.created_at,
        item_db_id: items.id,
        item_sku: items.sku,
        item_title: items.title,
        item_images: items.images,
        item_techniques: items.techniques,
        item_dimensions: items.dimensions,
        item_weight: items.weight,
      })
      .from(order_items)
      .innerJoin(items, eq(order_items.item_id, items.id))
      .where(eq(order_items.order_id, id));

    // Assemble nested response — mirrors the old Supabase wire shape:
    // order fields + order_items: [{ id, price_cents, source, item: { id, sku, title, images, techniques, dimensions, weight } }]
    const result = {
      ...order,
      order_items: itemRows.map((oi) => ({
        id: oi.id,
        order_id: oi.order_id,
        item_id: oi.item_id,
        price_cents: oi.price_cents,
        source: oi.source,
        created_at: oi.created_at,
        item: {
          id: oi.item_db_id,
          sku: oi.item_sku,
          title: oi.item_title,
          images: oi.item_images,
          techniques: oi.item_techniques,
          dimensions: oi.item_dimensions,
          weight: oi.item_weight,
        },
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in GET /api/orders/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
