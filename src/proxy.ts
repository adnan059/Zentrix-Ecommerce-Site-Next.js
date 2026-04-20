// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_BUYER = ["/orders", "/account", "/wishlist", "/reviews"];
const VENDOR_PREFIX = "/vendor";
const ADMIN_PREFIX = "/admin";

export default auth(async function middleware(
  req: NextRequest & { auth: unknown },
) {
  const { nextUrl, headers } = req;
  const session = (
    req as unknown as { auth: { user?: { role?: string } } | null }
  ).auth;
  const ip = getClientIp(headers);

  // ── Rate-limit NextAuth POST endpoints (login / register callbacks) ────
  if (nextUrl.pathname.startsWith("/api/auth/") && req.method === "POST") {
    const rl = rateLimit({ key: `auth:${ip}`, limit: 10, windowMs: 60_000 });
    if (!rl.success) {
      return new NextResponse(
        JSON.stringify({ error: "Too many attempts. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }
  }

  // ── Redirect authenticated users away from auth pages ──────────────────
  if (AUTH_ROUTES.some((r) => nextUrl.pathname === r)) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // ── Protect buyer routes ────────────────────────────────────────────────
  if (PROTECTED_BUYER.some((r) => nextUrl.pathname.startsWith(r))) {
    if (!session?.user) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Protect vendor routes ───────────────────────────────────────────────
  if (nextUrl.pathname.startsWith(VENDOR_PREFIX)) {
    if (!session?.user) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.user?.role as string | undefined;

    // Pending page is accessible to any logged-in user
    if (nextUrl.pathname === "/vendor/pending") {
      return NextResponse.next();
    }

    // Register page accessible to buyers (not yet vendors)
    if (nextUrl.pathname === "/vendor/register") {
      if (role === "vendor" || role === "admin") {
        return NextResponse.redirect(new URL("/vendor/dashboard", nextUrl));
      }
      return NextResponse.next();
    }

    // Dashboard and sub-pages require vendor or admin role
    if (role !== "vendor" && role !== "admin") {
      return NextResponse.redirect(new URL("/vendor/pending", nextUrl));
    }
  }

  // ── Protect admin routes ────────────────────────────────────────────────
  if (nextUrl.pathname.startsWith(ADMIN_PREFIX)) {
    if (!session?.user) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.user?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
