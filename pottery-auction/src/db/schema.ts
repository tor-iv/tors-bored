import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ──────────────────────────────────────────────────────────────────────────
// Tor's Bored — Postgres schema (migrated off Supabase).
//
// Property names are snake_case to MATCH the existing API/wire contract: the old
// Supabase rows were snake_case and the frontend + API request bodies expect
// snake_case. So `db.select().from(items)` is a drop-in for the old
// `supabase.from('items').select()` — the 15 route rewrites stay mechanical.
//
// Other design notes:
// - `profiles` IS the users table now (it used to FK to Supabase auth.users).
//   It gains `password_hash` (scrypt) and Stripe fields.
// - Dollar amounts use doublePrecision so they deserialize as JS numbers, the
//   way Supabase's numeric columns did — keeps bid-comparison code working.
// - `bids.auction_id` is ADDED (the old schema omitted it, silently breaking
//   close_ended_auctions()'s winner join).
// - `auctions.status` gains 'closing' and `bids.status` gains 'failed' to give
//   the cron-driven auction-close flow atomic states to transition through.
// ──────────────────────────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  display_name: text("display_name"),
  is_admin: boolean("is_admin").notNull().default(false),
  notifications: boolean("notifications").notNull().default(true),
  theme_preference: text("theme_preference").$type<"handdrawn" | "y2k" | "receipt">(),
  // Stripe (save-card auction model + buy-now): card data never lives here,
  // only Stripe's customer + saved payment-method handles.
  stripe_customer_id: text("stripe_customer_id"),
  default_payment_method: text("default_payment_method"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auctions = pgTable("auctions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),
  extended_end_date: timestamp("extended_end_date", { withTimezone: true }),
  status: text("status")
    .$type<"upcoming" | "active" | "closing" | "ended">()
    .notNull()
    .default("upcoming"),
  featured_image: text("featured_image"),
  reserve_price: doublePrecision("reserve_price"),
  soft_close_enabled: boolean("soft_close_enabled").default(true),
  soft_close_extension_minutes: integer("soft_close_extension_minutes").default(5),
  soft_close_window_minutes: integer("soft_close_window_minutes").default(2),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auction_id: uuid("auction_id").references(() => auctions.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    images: text("images").array().notNull().default([]),
    starting_bid: doublePrecision("starting_bid"),
    current_bid: doublePrecision("current_bid"),
    highest_bidder: uuid("highest_bidder").references(() => profiles.id, { onDelete: "set null" }),
    dimensions: jsonb("dimensions"),
    techniques: text("techniques").array().notNull().default([]),
    weight: doublePrecision("weight"),
    featured: boolean("featured").notNull().default(false),
    listing_type: text("listing_type").$type<"auction" | "buy_now">().notNull().default("auction"),
    sku: text("sku").unique(),
    reserve_price: doublePrecision("reserve_price"),
    buy_now_price: doublePrecision("buy_now_price"),
    sold_at: timestamp("sold_at", { withTimezone: true }),
    reserved_until: timestamp("reserved_until", { withTimezone: true }),
    reserved_order_id: uuid("reserved_order_id"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("items_reserved_until_idx").on(t.reserved_until)],
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status")
    .$type<"pending" | "paid" | "shipped" | "delivered" | "cancelled">()
    .notNull()
    .default("pending"),
  total_cents: integer("total_cents").notNull(),
  subtotal_cents: integer("subtotal_cents"),
  shipping_cents: integer("shipping_cents"),
  tax_cents: integer("tax_cents"),
  stripe_payment_intent_id: text("stripe_payment_intent_id"),
  stripe_checkout_session_id: text("stripe_checkout_session_id"),
  shipping_name: text("shipping_name"),
  shipping_line1: text("shipping_line1"),
  shipping_line2: text("shipping_line2"),
  shipping_city: text("shipping_city"),
  shipping_state: text("shipping_state"),
  shipping_postal_code: text("shipping_postal_code"),
  shipping_country: text("shipping_country").default("US"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const order_items = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  item_id: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),
  price_cents: integer("price_cents").notNull(),
  source: text("source").$type<"buy_now" | "auction_win">().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bids = pgTable(
  "bids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    auction_id: uuid("auction_id").references(() => auctions.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    amount: doublePrecision("amount").notNull(),
    stripe_payment_intent_id: text("stripe_payment_intent_id"),
    status: text("status")
      .$type<"pending" | "confirmed" | "outbid" | "won" | "failed">()
      .notNull()
      .default("confirmed"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bids_item_idx").on(t.item_id),
    index("bids_user_idx").on(t.user_id),
    index("bids_auction_idx").on(t.auction_id),
  ],
);

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  images: text("images").array().notNull().default([]),
  budget: doublePrecision("budget"),
  timeline: text("timeline"),
  status: text("status")
    .$type<"submitted" | "reviewing" | "accepted" | "declined" | "in_progress" | "completed">()
    .notNull()
    .default("submitted"),
  admin_notes: text("admin_notes"),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const watchlist = pgTable(
  "watchlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    item_id: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("watchlist_user_item_uq").on(t.user_id, t.item_id)],
);

// One Stripe SetupIntent / saved-card record per user per auction. Repurposed
// from the old pre-auth-hold model to the save-card model.
export const bid_payment_intents = pgTable(
  "bid_payment_intents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    auction_id: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, { onDelete: "cascade" }),
    stripe_setup_intent_id: text("stripe_setup_intent_id"),
    stripe_payment_method_id: text("stripe_payment_method_id"),
    status: text("status")
      .$type<"requires_payment_method" | "ready" | "charged" | "failed" | "canceled">()
      .notNull()
      .default("requires_payment_method"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("bid_pi_user_auction_uq").on(t.user_id, t.auction_id)],
);

// Webhook idempotency dedup — unchanged from Supabase.
export const stripe_events = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  received_at: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sku_type_codes = pgTable("sku_type_codes", {
  type_code: text("type_code").primaryKey(),
  item_type: text("item_type").notNull(),
});

// Inferred row/insert types (replaces database.types.ts).
export type Profile = typeof profiles.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof order_items.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type Watchlist = typeof watchlist.$inferSelect;
export type BidPaymentIntent = typeof bid_payment_intents.$inferSelect;
