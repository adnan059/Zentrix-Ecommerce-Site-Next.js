import { auth } from "@/auth";
import { NextResponse } from "next/server";

const buyerRoutes = ["/account", "/orders", "/wishlist", "/cart/checkout"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isVendorRoute = pathname.startsWith("/vendor");
  const isAdminRoute = pathname.startsWith("/admin");
  const isBuyerRoute = buyerRoutes.some((r) => pathname.startsWith(r));

  if ((isVendorRoute || isAdminRoute || isBuyerRoute) && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isVendorRoute && session?.user.role !== "vendor") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/cart/checkout/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};
