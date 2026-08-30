import { redirect } from "next/navigation";
import { getCurrentIdentity } from "@/services/auth.service";
import { roleHomeRoute } from "@/domain/permissions/permissions";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { ProductAttribution } from "@/components/ProductAttribution";

export default async function ResetPasswordPage() {
  const identity = await getCurrentIdentity();
  // No session means the recovery link was missing/expired/already used —
  // send them back to request a fresh one rather than showing a dead form.
  if (!identity) redirect("/forgot-password?error=session_expired");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-[#082B5C]">Atur Password Baru</h1>
        <p className="mt-2 text-sm text-slate-500">Masukkan password baru untuk akun {identity.profile.email}.</p>
        <div className="mt-6">
          <ResetPasswordForm homeRoute={roleHomeRoute(identity.profile.role)} />
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5"><ProductAttribution centered /></div>
      </div>
    </main>
  );
}
