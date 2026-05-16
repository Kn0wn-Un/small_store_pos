import { type NextRequest, NextResponse } from "next/server";

import type { Role } from "@/constants/roles";
import { DEFAULT_REDIRECT_BY_ROLE } from "@/constants/routes";
import { updateSession } from "@/supabase/middleware";

const ADMIN_PREFIX = "/admin";
const POS_PREFIX = "/pos";
const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

function normalizeRole(role: string | null | undefined): Role {
  const value = (role ?? "customer").toLowerCase();
  if (value === "admin" || value === "cashier" || value === "customer") {
    return value;
  }
  return "customer";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { supabase, response, user } = await updateSession(request);

  const isAdminArea = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  const isPosArea = pathname === POS_PREFIX || pathname.startsWith(`${POS_PREFIX}/`);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  let role: Role = "customer";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = normalizeRole(profile?.role);
  }

  if (pathname === ADMIN_PREFIX) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_BY_ROLE.admin, request.url));
  }

  if ((isAdminArea || isPosArea) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_BY_ROLE[role], request.url));
  }

  if (isPosArea && role !== "admin" && role !== "cashier") {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_BY_ROLE[role], request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_BY_ROLE[role], request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
