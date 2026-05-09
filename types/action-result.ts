import type { Role } from "@/constants/roles";

export type ActionError = {
  field: string;
  message: string;
  code?: string;
};

export type ActionResult<TData = null> = {
  success: boolean;
  message: string;
  data: TData | null;
  errors?: ActionError[];
};

export type AuthenticatedActor = {
  userId: string;
  role: Role;
};
