import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Client-readable current-user endpoint. With encrypted iron-session cookies the
// browser can't decode the session itself (unlike Supabase's client SDK), so the
// client store hydrates from here on mount instead of onAuthStateChange.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      notifications: user.notifications,
      hasSavedCard: !!user.defaultPaymentMethod,
    },
  });
}
