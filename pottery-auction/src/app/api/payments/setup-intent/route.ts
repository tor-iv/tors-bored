import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateCustomer } from "@/lib/stripe/customer";

export const runtime = "nodejs";

// POST /api/payments/setup-intent — start saving a card so the user can bid.
// Returns a SetupIntent client secret for Stripe Elements. The card is captured
// off-session later (when they win an auction); nothing is charged now. The
// saved payment method is persisted to the profile via the setup_intent.succeeded
// webhook.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = await getOrCreateCustomer({
    userId: user.id,
    email: user.email,
    existingCustomerId: user.stripeCustomerId,
  });

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: "off_session",
    payment_method_types: ["card"],
    metadata: { user_id: user.id },
  });

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
    hasSavedCard: !!user.defaultPaymentMethod,
  });
}
