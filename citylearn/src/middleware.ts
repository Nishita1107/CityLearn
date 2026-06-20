import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;
  const { pathname } = request.nextUrl;

  // List of protected routes
  const protectedRoutes = [
    "/dashboard",
    "/analysis-engine",
    "/institutional-memory-match",
    "/predictive-intelligence",
    "/strategic-recommendations",
    "/knowledge-graph",
    "/learning-loop",
    "/profile",
    "/profile-setup"
  ];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from sign-in/sign-up
  const authRoutes = ["/sign-in", "/sign-up"];
  if (authRoutes.includes(pathname) && userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analysis-engine/:path*",
    "/institutional-memory-match/:path*",
    "/predictive-intelligence/:path*",
    "/strategic-recommendations/:path*",
    "/knowledge-graph/:path*",
    "/learning-loop/:path*",
    "/profile/:path*",
    "/profile-setup/:path*",
    "/sign-in",
    "/sign-up"
  ],
};
