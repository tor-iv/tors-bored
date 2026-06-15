import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSession } from "./session";

// Read-only auth helpers. Kept OUT of any "use server" actions file so they are
// never exposed as client-callable RPC. Selects exclude password_hash.
//
// IMPORTANT (RLS-backstop): Supabase RLS used to be a silent second layer under
// these checks. It's gone now — every Drizzle query runs with full privileges,
// so API routes MUST gate on getCurrentUser()/requireUser()/requireAdmin() and
// filter user-scoped reads by the returned id. There is no safety net beneath.

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  notifications: boolean;
  themePreference: "handdrawn" | "y2k" | "receipt" | null;
  stripeCustomerId: string | null;
  defaultPaymentMethod: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session.userId) return null;

  const rows = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      displayName: profiles.display_name,
      isAdmin: profiles.is_admin,
      notifications: profiles.notifications,
      themePreference: profiles.theme_preference,
      stripeCustomerId: profiles.stripe_customer_id,
      defaultPaymentMethod: profiles.default_payment_method,
    })
    .from(profiles)
    .where(eq(profiles.id, session.userId))
    .limit(1);

  return rows[0] ?? null;
}

/** Throws-style guard for API routes: returns the user or null (caller 401s). */
export async function requireUser(): Promise<CurrentUser | null> {
  return getCurrentUser();
}

/** Returns the user only if admin, else null (caller 401/403s). */
export async function requireAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}
