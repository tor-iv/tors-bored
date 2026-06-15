"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

// Server actions replacing Supabase Auth. Next.js validates the Origin header on
// server-action POSTs (CSRF defense); combined with the httpOnly sameSite=lax
// session cookie, this covers the CSRF hardening the plan called for. Login is
// additionally rate-limited per IP.

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "vcox484@gmail.com").toLowerCase();

const credsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  displayName: z.string().min(1).max(80).optional(),
});

export type AuthResult =
  | { ok: true; user: { id: string; email: string; isAdmin: boolean; displayName: string | null } }
  | { ok: false; error: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  // Caddy sets X-Forwarded-For; take the first hop.
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export async function signupAction(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthResult> {
  const parsed = credsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and a password of at least 8 characters." };
  }
  const email = parsed.data.email.toLowerCase();

  // Rate-limit signups per IP (10 / 10 min) to blunt automated account creation.
  const ip = await clientIp();
  const rl = rateLimit(`signup:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.ok) return { ok: false, error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` };

  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const [created] = await db
    .insert(profiles)
    .values({
      email,
      password_hash: hashPassword(parsed.data.password),
      display_name: parsed.data.displayName ?? null,
      is_admin: email === ADMIN_EMAIL,
    })
    .returning({ id: profiles.id, email: profiles.email, isAdmin: profiles.is_admin, displayName: profiles.display_name });

  const session = await getSession();
  session.userId = created.id;
  session.email = created.email;
  session.isAdmin = created.isAdmin;
  await session.save();

  return { ok: true, user: created };
}

export async function loginAction(input: { email: string; password: string }): Promise<AuthResult> {
  const ip = await clientIp();
  // 5 attempts / 15 min per IP. Deliberately strict for a money app.
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false, error: `Too many login attempts. Try again in ${rl.retryAfterSeconds}s.` };
  }

  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid email or password." };
  const email = parsed.data.email.toLowerCase();

  const rows = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      isAdmin: profiles.is_admin,
      displayName: profiles.display_name,
      passwordHash: profiles.password_hash,
    })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  const profile = rows[0];
  // Same vague error whether the email is unknown or the password is wrong.
  if (!profile || !verifyPassword(parsed.data.password, profile.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }

  const session = await getSession();
  session.userId = profile.id;
  session.email = profile.email;
  session.isAdmin = profile.isAdmin;
  await session.save();

  return {
    ok: true,
    user: { id: profile.id, email: profile.email, isAdmin: profile.isAdmin, displayName: profile.displayName },
  };
}

export async function logoutAction(): Promise<{ ok: true }> {
  const session = await getSession();
  session.destroy();
  return { ok: true };
}
