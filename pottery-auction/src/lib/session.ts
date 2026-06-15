import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionOptions } from "iron-session";

// iron-session setup ported from fieldhouse. Sessions are encrypted, signed,
// httpOnly cookies — not readable or forgeable by the client. This replaces
// Supabase Auth's session handling.

export interface SessionData {
  userId: string;
  email: string;
  isAdmin: boolean;
}

function resolveSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to a 32+ character value in production");
  }
  console.warn("tors-bored: SESSION_SECRET not set — using insecure dev secret");
  return "dev-only-secret-never-used-in-production-pad";
}

function sessionOptions(): SessionOptions {
  return {
    cookieName: "tors-bored-session",
    password: resolveSecret(),
    ttl: 30 * 24 * 60 * 60, // 30 days — shorter than fieldhouse since this is a money app
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.HTTPS === "true",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
