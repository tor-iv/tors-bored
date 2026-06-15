import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { stripe } from "./server";

// Get-or-create the Stripe Customer for a profile, persisting the id. Used by
// the save-card (SetupIntent) flow and by off-session auction charges.
export async function getOrCreateCustomer(opts: {
  userId: string;
  email: string;
  existingCustomerId: string | null;
}): Promise<string> {
  if (opts.existingCustomerId) return opts.existingCustomerId;

  const customer = await stripe.customers.create({
    email: opts.email,
    metadata: { user_id: opts.userId },
  });

  await db
    .update(profiles)
    .set({ stripe_customer_id: customer.id, updated_at: new Date() })
    .where(eq(profiles.id, opts.userId));

  return customer.id;
}
