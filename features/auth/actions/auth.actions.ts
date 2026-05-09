"use server";

import type { AuthActionState } from "@/types/auth";
import { authService } from "../services/auth.service";

export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  return authService.login({
    email: formData.get("email"),
    password: formData.get("password"),
  });
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
  return authService.resetPassword({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
}
