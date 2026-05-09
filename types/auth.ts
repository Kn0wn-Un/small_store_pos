import type { Role } from "@/constants/roles";

export type AuthActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  redirectTo?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};
