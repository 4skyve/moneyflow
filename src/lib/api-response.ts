import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: { message, details } }, { status });
}

/**
 * Wrap a route handler body so every /api/v1 endpoint returns errors in the
 * same shape, without every route re-implementing try/catch.
 */
export function withApiErrorHandling(fn: () => Promise<Response>): Promise<Response> {
  return fn().catch((err: unknown) => {
    if (err instanceof ZodError) {
      return apiError("Validasi gagal", 422, err.issues);
    }
    if (err instanceof Error) {
      if (err.message === "Unauthorized") return apiError("Unauthorized", 401);
      return apiError(err.message, 400);
    }
    console.error(err);
    return apiError("Terjadi kesalahan pada server", 500);
  });
}
