import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { verifyAccessToken } from "@/lib/jwt";

/**
 * Single source of truth for "who is making this request".
 * Used by every function in lib/actions.ts, so both the website (cookie session)
 * and the mobile REST API (Bearer JWT) share the exact same business logic.
 */
export async function getCurrentUserId(): Promise<string | null> {
  // 1. Website: NextAuth cookie session
  const session = await auth();
  const cookieUserId = (session?.user as any)?.id as string | undefined;
  if (cookieUserId) return cookieUserId;

  // 2. Mobile: Authorization: Bearer <jwt>
  const hdrs = await headers();
  const authHeader = hdrs.get("authorization") ?? hdrs.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);
    if (payload) return payload.userId;
  }

  return null;
}
