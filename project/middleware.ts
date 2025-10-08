import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface CustomJWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return NextResponse.next();
  // don't check token if in these pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as unknown as CustomJWTPayload;

    const roleRoutes = {
      "/admin": ["admin", "uc"],
      "/dashboard/admin": ["admin"],
      "/dashboard/assistant": ["teaching assistant"],
      "/dashboard/coordinator": ["uc"],
      "/dashboard/tutor": ["tutor"],
      "/portal": ["uc", "tutor", "teaching assistant", "admin"],
    };

    for (const [route, requiredRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        const hasRequiredRole = requiredRoles.some((role) =>
          decoded.roles.includes(role),
        );

        if (!hasRequiredRole) {
          return NextResponse.redirect(new URL("/portal", request.url));
        }
      }
    }

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

// Ignore the files that regex describes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
