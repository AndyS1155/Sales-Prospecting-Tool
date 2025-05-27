import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const cookiePassword = req.cookies.get("access_token");

  const isProtectedRoute = !url.pathname.startsWith("/login") && !url.pathname.startsWith("/_next");

  if (isProtectedRoute && cookiePassword?.value !== process.env.ACCESS_PASSWORD) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"], // protect all routes except APIs/static
};
