"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/app/actions/auth";
import type { ActionResult } from "@/types/auth";

export function ResetPasswordForm({ homeRoute }: { homeRoute: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updatePasswordAction, { ok: false } as ActionResult);

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(() => router.push(homeRoute), 1200);
      return () => clearTimeout(timer);
    }
  }, [state.ok, router, homeRoute]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#334155]">Password Baru</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
          className="min-h-12 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#172033] transition placeholder:text-[#94A3B8] hover:border-[#94A3B8] focus:border-[#0B4EA2] focus:outline-none focus:ring-4 focus:ring-[#0B4EA2]/10"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-[#334155]">Konfirmasi Password Baru</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Ulangi password baru"
          className="min-h-12 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#172033] transition placeholder:text-[#94A3B8] hover:border-[#94A3B8] focus:border-[#0B4EA2] focus:outline-none focus:ring-4 focus:ring-[#0B4EA2]/10"
        />
      </div>
      {(state.message || state.fieldErrors) && (
        <div role="alert" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm leading-5 ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(11,78,162,0.22)] transition hover:bg-[#083F85] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
      >
        {pending ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}
