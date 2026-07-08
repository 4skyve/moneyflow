import { requireApiUserId } from "@/lib/api-auth";
import { apiOk, apiError, withApiErrorHandling } from "@/lib/api-response";
import { getStatsData } from "@/lib/queries";

const VALID_PERIODS = ["daily", "weekly", "monthly", "yearly"] as const;

export async function GET(req: Request) {
  return withApiErrorHandling(async () => {
    const userId = await requireApiUserId();
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") ?? "monthly") as (typeof VALID_PERIODS)[number];

    if (!VALID_PERIODS.includes(period)) {
      return apiError("period harus salah satu dari: daily, weekly, monthly, yearly", 422);
    }

    const data = await getStatsData(userId, period);
    return apiOk(data);
  });
}
