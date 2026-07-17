import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthPath = AUTH_PATHS.includes(pathname);

  if (!isLoggedIn && !isPublicPath) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  // Logged-in users skip the landing page and auth forms straight to the dashboard.
  if (isLoggedIn && (isAuthPath || pathname === "/")) {
    const url = new URL("/dashboard", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
