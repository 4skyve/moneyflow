import { getCurrentUserId } from "@/lib/auth-context";

/** Every /api/v1 route (except auth/login, auth/register) calls this first. */
export async function requireApiUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
