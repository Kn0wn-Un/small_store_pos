export const ROLES = {
  ADMIN: "admin",
  CASHIER: "cashier",
  CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
