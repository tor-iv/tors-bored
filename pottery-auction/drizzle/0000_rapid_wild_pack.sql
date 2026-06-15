CREATE TABLE "auctions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"extended_end_date" timestamp with time zone,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"featured_image" text,
	"reserve_price" double precision,
	"soft_close_enabled" boolean DEFAULT true,
	"soft_close_extension_minutes" integer DEFAULT 5,
	"soft_close_window_minutes" integer DEFAULT 2,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bid_payment_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"auction_id" uuid NOT NULL,
	"stripe_setup_intent_id" text,
	"stripe_payment_method_id" text,
	"status" text DEFAULT 'requires_payment_method' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bid_pi_user_auction_uq" UNIQUE("user_id","auction_id")
);
--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"auction_id" uuid,
	"user_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"budget" double precision,
	"timeline" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auction_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"starting_bid" double precision,
	"current_bid" double precision,
	"highest_bidder" uuid,
	"dimensions" jsonb,
	"techniques" text[] DEFAULT '{}' NOT NULL,
	"weight" double precision,
	"featured" boolean DEFAULT false NOT NULL,
	"listing_type" text DEFAULT 'auction' NOT NULL,
	"sku" text,
	"reserve_price" double precision,
	"buy_now_price" double precision,
	"sold_at" timestamp with time zone,
	"reserved_until" timestamp with time zone,
	"reserved_order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"price_cents" integer NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_cents" integer NOT NULL,
	"subtotal_cents" integer,
	"shipping_cents" integer,
	"tax_cents" integer,
	"stripe_payment_intent_id" text,
	"stripe_checkout_session_id" text,
	"shipping_name" text,
	"shipping_line1" text,
	"shipping_line2" text,
	"shipping_city" text,
	"shipping_state" text,
	"shipping_postal_code" text,
	"shipping_country" text DEFAULT 'US',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"notifications" boolean DEFAULT true NOT NULL,
	"theme_preference" text,
	"stripe_customer_id" text,
	"default_payment_method" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sku_type_codes" (
	"type_code" text PRIMARY KEY NOT NULL,
	"item_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_user_item_uq" UNIQUE("user_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "bid_payment_intents" ADD CONSTRAINT "bid_payment_intents_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_payment_intents" ADD CONSTRAINT "bid_payment_intents_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_highest_bidder_profiles_id_fk" FOREIGN KEY ("highest_bidder") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bids_item_idx" ON "bids" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "bids_user_idx" ON "bids" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bids_auction_idx" ON "bids" USING btree ("auction_id");--> statement-breakpoint
CREATE INDEX "items_reserved_until_idx" ON "items" USING btree ("reserved_until");