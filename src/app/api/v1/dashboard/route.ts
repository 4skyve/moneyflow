import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, withApiErrorHandling } from "@/lib/api-response";
import { getDashboardData } from "@/lib/queries";

export async function GET() {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const data = await getDashboardData(userId);
    return apiOk(data);
  });
}
