"use server";

import { redirect } from "next/navigation";

import { resolvePostLoginRedirect } from "@/lib/auth/resolve-redirect";
import type { Role } from "@/constants/roles";
import type { AuthActionState } from "@/types/auth";
import { authService } from "../services/auth.service";

export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const requestedRedirect = formData.get("redirectTo")?.toString() ?? null;
  const result = await authService.login({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return result;
  }

  const role = (result.role ?? "customer") as Role;
  redirect(resolvePostLoginRedirect(role, requestedRedirect ?? result.redirectTo));
}

export async function registerAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  return authService.register({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
}

export async function forgotPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  return authService.forgotPassword({
    email: formData.get("email"),
  });
}

export async function resetPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const result = await authService.resetPassword({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (result.success && result.redirectTo) {
    redirect(result.redirectTo);
  }

  return result;
}
