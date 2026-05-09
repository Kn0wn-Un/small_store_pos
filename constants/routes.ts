export const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"] as const;

export const DASHBOARD_ROUTES = {
  admin: "/admin",
  pos: "/pos",
} as const;

export const DEFAULT_REDIRECT_BY_ROLE = {
  admin: "/admin/analytics",
  cashier: "/pos/billing",
  customer: "/products",
} as const;
