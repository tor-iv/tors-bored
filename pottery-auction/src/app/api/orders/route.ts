import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, order_items, items } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/orders — the caller's own orders (with nested order_items + item).
 * Admins see all orders. Normal users see only their own (explicit owner filter —
 * RLS is gone, so the .where(eq(orders.user_id, user.id)) is the only gate).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch orders — admins see all, normal users see only their own.
    const orderRows = user.isAdmin
      ? await db.select().from(orders).orderBy(desc(orders.created_at))
      : await db
          .select()
          .from(orders)
          .where(eq(orders.user_id, user.id))
          .orderBy(desc(orders.created_at));

    if (orderRows.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch all order_items for these orders in one query, joined to items for
    // id/sku/title/images — matching the old Supabase nested select shape.
    const orderIds = orderRows.map((o) => o.id);

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
      })
      .from(order_items)
      .innerJoin(items, eq(order_items.item_id, items.id))
      .where(inArray(order_items.order_id, orderIds));

    // Group order_items by order_id.
    const itemsByOrder = new Map<string, typeof itemRows>();
    for (const row of itemRows) {
      const list = itemsByOrder.get(row.order_id) ?? [];
      list.push(row);
      itemsByOrder.set(row.order_id, list);
    }

    // Assemble the nested response — mirrors the old Supabase wire shape:
    // order fields + order_items: [{ id, price_cents, source, item: { id, sku, title, images } }]
    const result = orderRows.map((order) => ({
      ...order,
      order_items: (itemsByOrder.get(order.id) ?? []).map((oi) => ({
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
        },
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in GET /api/orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
