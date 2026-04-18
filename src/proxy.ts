// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const buyerRoutes = [
  "/account",
  "/orders",
  "/wishlist",
  "/reviews",
  "/cart/checkout",
];

// These /vendor/* paths require login but NOT the vendor role.
// Any authenticated user (buyer applying, or pending vendor) can access them.
const vendorPublicRoutes = ["/vendor/register", "/vendor/pending"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isVendorRoute = pathname.startsWith("/vendor");
  const isAdminRoute = pathname.startsWith("/admin");
  const isBuyerRoute = buyerRoutes.some((r) => pathname.startsWith(r));
  const isVendorPublicRoute = vendorPublicRoutes.some((r) =>
    pathname.startsWith(r),
  );

  // Step 1: Require login for all protected routes
  if ((isVendorRoute || isAdminRoute || isBuyerRoute) && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Step 2: Admin-only routes
  if (isAdminRoute && session?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Step 3: Vendor-only routes — skip the public vendor routes
  if (
    isVendorRoute &&
    !isVendorPublicRoute &&
    session?.user.role !== "vendor"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/reviews/:path*",
    "/cart/checkout/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};
