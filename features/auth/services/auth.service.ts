import { DEFAULT_REDIRECT_BY_ROLE } from "@/constants/routes";
import type { Role } from "@/constants/roles";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/schemas/auth";
import type { AuthActionState } from "@/types/auth";
import { AuthRepository } from "../repositories/auth.repository";

const authRepository = new AuthRepository();

function normalizeRole(role: string | null | undefined): Role {
  const value = (role ?? "customer").toLowerCase();
  if (value === "admin" || value === "cashier" || value === "customer") {
    return value;
  }
  return "customer";
}

export class AuthService {
  async login(payload: unknown): Promise<AuthActionState & { role?: Role }> {
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid login form data.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { data, error } = await authRepository.signInWithPassword(parsed.data.email, parsed.data.password);
    if (error || !data.user) {
      return { success: false, message: error?.message ?? "Unable to sign in." };
    }

    const roleLookup = await authRepository.getUserRole(data.user.id);
    const role = normalizeRole(roleLookup.data);
    const redirectTo = DEFAULT_REDIRECT_BY_ROLE[role];

    return {
      success: true,
      message: "Signed in successfully.",
      redirectTo,
      role,
    };
  }

  async register(payload: unknown): Promise<AuthActionState> {
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid registration form data.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { fullName, email, password } = parsed.data;
    const { error } = await authRepository.registerWithPassword(email, password, fullName);

    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message: "Account created. Check your email to verify your account.",
    };
  }

  async forgotPassword(payload: unknown): Promise<AuthActionState> {
    const parsed = forgotPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid email address.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
    const { error } = await authRepository.sendPasswordResetEmail(parsed.data.email, redirectTo);
    if (error) return { success: false, message: error.message };

    return { success: true, message: "Password reset email sent." };
  }

  async resetPassword(payload: unknown): Promise<AuthActionState> {
    const parsed = resetPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid password payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error } = await authRepository.updatePassword(parsed.data.password);
    if (error) return { success: false, message: error.message };

    return { success: true, message: "Password updated successfully.", redirectTo: "/login" };
  }
}

export const authService = new AuthService();
