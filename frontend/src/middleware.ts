import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  // Public paths
  const publicPaths = ["/", "/login", "/register", "/shops", "/checkout"];
  const isPublicPath = publicPaths.some((p) => path.startsWith(p));

  // Auth pages
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // If logged in and trying to access auth pages, redirect to appropriate dashboard
  if (token && isAuthPath) {
    try {
      // Decode token to get role (simplified, use proper JWT decode in production)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "platform_admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (role === "shop_owner") {
        return NextResponse.redirect(new URL("/dashboard/shop", request.url));
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid token, continue to login
    }
  }

  // If not logged in and trying to access protected routes
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based protection
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      // Admin routes
      if (path.startsWith("/admin") && role !== "platform_admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Shop owner routes
      if (
        path.startsWith("/dashboard/shop") &&
        !["shop_owner", "platform_admin"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Customer routes
      if (path.startsWith("/dashboard/customer") && role !== "customer") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};