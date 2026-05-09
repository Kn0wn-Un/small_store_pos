"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/features/auth/actions/auth.actions";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormMode = "login" | "register" | "forgot-password" | "reset-password";
const baseState = { success: false, message: "" };

const schemaByMode = {
  login: loginSchema,
  register: registerSchema,
  "forgot-password": forgotPasswordSchema,
  "reset-password": resetPasswordSchema,
} as const;

const titleByMode: Record<FormMode, string> = {
  login: "Login",
  register: "Create Account",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
};

type AnyValues = z.infer<typeof loginSchema> &
  Partial<z.infer<typeof registerSchema>> &
  Partial<z.infer<typeof forgotPasswordSchema>> &
  Partial<z.infer<typeof resetPasswordSchema>>;

export function AuthForm({ mode }: { mode: FormMode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AnyValues>({
    resolver: zodResolver(schemaByMode[mode]),
    defaultValues:
      mode === "register"
        ? { fullName: "", email: "", password: "", confirmPassword: "" }
        : mode === "forgot-password"
          ? { email: "" }
          : mode === "reset-password"
            ? { password: "", confirmPassword: "" }
            : { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value));
      });

      const action =
        mode === "login"
          ? loginAction
          : mode === "register"
            ? registerAction
            : mode === "forgot-password"
              ? forgotPasswordAction
              : resetPasswordAction;

      const result = await action(baseState, formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (result.redirectTo) router.push(result.redirectTo);
    });
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titleByMode[mode]}</CardTitle>
        <CardDescription>Secure access for admin, cashier, and customer roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...form.register("fullName")} aria-invalid={!!form.formState.errors.fullName} />
            </div>
          )}

          {mode !== "reset-password" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} aria-invalid={!!form.formState.errors.email} />
            </div>
          )}

          {mode !== "forgot-password" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                aria-invalid={!!form.formState.errors.password}
              />
            </div>
          )}

          {(mode === "register" || mode === "reset-password") && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                aria-invalid={!!form.formState.errors.confirmPassword}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Please wait..." : titleByMode[mode]}
          </Button>

          {mode === "login" && (
            <div className="flex justify-between text-sm">
              <Link href="/forgot-password" className="underline">
                Forgot password?
              </Link>
              <Link href="/register" className="underline">
                Create account
              </Link>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
