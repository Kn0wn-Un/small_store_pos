import { createClient } from "@/supabase/server";

export class AuthRepository {
  async signInWithPassword(email: string, password: string) {
    const supabase = await createClient();
    return supabase.auth.signInWithPassword({ email, password });
  }

  async registerWithPassword(email: string, password: string, fullName: string) {
    const supabase = await createClient();

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
  }

  async sendPasswordResetEmail(email: string, redirectTo: string) {
    const supabase = await createClient();
    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }

  async updatePassword(password: string) {
    const supabase = await createClient();
    return supabase.auth.updateUser({ password });
  }

  async signOut() {
    const supabase = await createClient();
    return supabase.auth.signOut();
  }

  async getUserRole(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    return { data: data?.role ?? "customer", error };
  }
}
