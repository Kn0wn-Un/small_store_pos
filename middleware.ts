import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/supabase/middleware";

const ADMIN_PREFIX = "/admin";
const POS_PREFIX = "/pos";
const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { supabase, response } = updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminArea = pathname.startsWith(ADMIN_PREFIX);
  const isPosArea = pathname.startsWith(POS_PREFIX);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if ((isAdminArea || isPosArea) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? "customer";
  }

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  if (isPosArea && role !== "admin" && role !== "cashier") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  if (isAuthRoute && user) {
    const destination =
      role === "admin" ? "/admin/analytics" : role === "cashier" ? "/pos/billing" : "/products";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
