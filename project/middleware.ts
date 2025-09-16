import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface JWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify and decode JWT using jose (Edge Runtime compatible)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as JWTPayload;

    // Define role-based access rules
    const roleRoutes = {
      "/admin": ["admin"],
      "/tutor-dashboard": ["tutor", "admin"],
      "/portal": ["uc", "tutor", "teaching assistant", "admin"],
    };

    // Check if current path requires specific roles
    for (const [route, requiredRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        const hasRequiredRole = requiredRoles.some((role) =>
          decoded.roles.includes(role),
        );

        if (!hasRequiredRole) {
          // Redirect to unauthorized page or portal based on user roles
          if (decoded.roles.includes("admin")) {
            return NextResponse.redirect(new URL("/admin", request.url));
          } else if (decoded.roles.includes("tutor")) {
            return NextResponse.redirect(
              new URL("/tutor-dashboard", request.url),
            );
          } else {
            return NextResponse.redirect(new URL("/portal", request.url));
          }
        }
      }
    }

    // Add user info to request headers for pages/API routes to use
    const response = NextResponse.next();
    response.headers.set("x-user-id", decoded.userId.toString());
    response.headers.set("x-user-email", decoded.email);
    response.headers.set("x-user-roles", JSON.stringify(decoded.roles));

    return response;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
