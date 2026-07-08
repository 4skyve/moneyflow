import { NextResponse } from "next/server";
import { z } from "zod";
import { createUserAccount, CredentialError } from "@/lib/credentials";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  try {
    await createUserAccount(parsed.data.name, parsed.data.email, parsed.data.password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof CredentialError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
