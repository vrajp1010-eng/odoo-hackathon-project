import { NextRequest, NextResponse } from "next/server";

// Next.js 16: middleware.ts is deprecated, use proxy.ts instead
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/public"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/public/")
  );

  // API and static routes
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticRoute = pathname.startsWith("/_next/") || pathname.includes(".");

  if (isPublicRoute || isApiRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // Check for session token (optimistic check - real auth happens in server components)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
