"use server";

import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/validation/auth.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { roleHomeRoute } from "@/domain/permissions/permissions";
import type { ActionResult, UserRole } from "@/types/auth";

export async function loginAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };

  let destination = "/dashboard";
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user) return { ok: false, code: "UNAUTHORIZED", message: "Email atau password tidak sesuai." };

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role,is_active").eq("id", data.user.id).single();
    if (profileError || !profile) {
      await supabase.auth.signOut();
      return { ok: false, code: "DATABASE", message: "Profil pengguna belum tersedia." };
    }
    if (!profile.is_active) {
      await supabase.auth.signOut();
      return { ok: false, code: "FORBIDDEN", message: "Akun ini telah dinonaktifkan. Hubungi admin jika ini keliru." };
    }
    const role = profile.role as UserRole;
    destination = roleHomeRoute(role);
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return { ok: false, code: "CONFIGURATION", message: error.message };
    console.error("login failure", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Login gagal karena layanan sedang bermasalah." };
  }
  redirect(destination);
}

export async function registerAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    classCode: formData.get("classCode") || undefined,
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.fullName } },
    });
    if (error) return { ok: false, code: "DATABASE", message: error.message };
    if (data.session && parsed.data.classCode) {
      const { error: joinError } = await supabase.rpc("join_class_by_code", { target_code: parsed.data.classCode });
      if (joinError) return { ok: false, code: "VALIDATION", message: "Akun dibuat, tetapi kode kelas tidak valid atau kelas belum aktif." };
    }
    if (!data.session) return { ok: true, message: "Akun dibuat. Periksa email Anda untuk mengaktifkan akun." };
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return { ok: false, code: "CONFIGURATION", message: error.message };
    console.error("registration failure", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Pendaftaran gagal karena layanan sedang bermasalah." };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("logout failure", error instanceof Error ? error.message : "unknown");
  }
  redirect("/login");
}
