import { SignJWT, jwtVerify } from "jose";

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

const ACCESS_TOKEN_TTL = "30d"; // mobile tokens live longer than web session cookie

export async function signAccessToken(userId: string, email: string) {
  return await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret());
}

export async function verifyAccessToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { userId: payload.sub, email: (payload.email as string) ?? "" };
  } catch {
    return null;
  }
}
