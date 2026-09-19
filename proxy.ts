import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.[^/]+$/;

// Only the client portal (and its linked onboarding flow) is enabled. The
// public marketing site is disabled by redirecting every other request
// to the portal.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/portal") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/portal/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
