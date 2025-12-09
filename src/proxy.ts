import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/env";

export default async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET,
  });

  // Protect all /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      console.log("No token found");
      const signInUrl = new URL("/api/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Debug: log the token to see what's in it
    console.log("Token:", JSON.stringify(token, null, 2));

    // Check if user has ADMIN role
    if (token.role !== "ADMIN") {
      console.log("User role is not ADMIN, role is:", token.role);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
