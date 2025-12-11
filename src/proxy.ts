import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/env";

export default async function proxy(request: NextRequest) {
  // Why on earth wasnt this documented lol seriously
  const sessionCookieName =
    process.env.NEXTAUTH_URL?.startsWith("https://") ||
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET,
    cookieName: sessionCookieName,
  });

  // Protect all /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      const signInUrl = new URL("/api/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has ADMIN role
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
