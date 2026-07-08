import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, theme: users.theme, mode: users.mode, currency: users.currency })
      .from(users)
      .where(eq(users.id, userId));
    return apiOk({ user });
  });
}
